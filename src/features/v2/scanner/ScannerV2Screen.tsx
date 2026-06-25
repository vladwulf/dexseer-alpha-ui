import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerMomentumHeatmap } from "./components/ScannerMomentumHeatmap";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
import {
  useGetMarketStrip,
  useGetScannerAssetDetails,
  useGetScannerAssetDetailsChart,
  useGetScannerCharts,
} from "./hooks/scanner.api";
import { useIsMobileScanner } from "./hooks/useIsMobileScanner";
import { useLiveScannerFeed } from "./hooks/useLiveScannerFeed";
import { useScannerState } from "./hooks/useScannerState";
import {
  getSupportedScannerChartTimeframe,
  mapMarketStripResponse,
  mapScannerCandlesToOhlcv,
  mergeDetailsIntoAsset,
} from "./lib/apiAdapters";

export function ScannerV2Screen() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<"manual" | "live">(
    "live",
  );
  const isMobileScanner = useIsMobileScanner();
  const marketStripQuery = useGetMarketStrip();
  const {
    density,
    filteredAssets,
    minVolume,
    preset,
    search,
    selectedAsset,
    selectedSymbol,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setPreset,
    setSearch,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
    momentumQuery,
    scannerQuery,
  } = useScannerState({ refreshInterval });
  const chartTimeframe = getSupportedScannerChartTimeframe(timeframe);
  useLiveScannerFeed({ preset });
  const refetchIntervalMs = refreshInterval === "live" ? 3000 : false;
  const tableAssetIds = useMemo(
    () =>
      [
        ...new Set(
          filteredAssets
            .map((asset) => asset.assetId)
            .filter((assetId): assetId is number => assetId !== undefined),
        ),
      ].sort((left, right) => left - right),
    [filteredAssets],
  );
  const assetIdsKey = useMemo(() => tableAssetIds.join(","), [tableAssetIds]);
  const tableChartParams = useMemo(() => {
    if (!assetIdsKey) {
      return null;
    }

    return {
      asset_ids: assetIdsKey,
      timeframe: chartTimeframe,
      // Ask for one extra slot so the current open candle can coexist with the
      // last 40 persisted candles when the backend includes live Redis buckets.
      limit: 41,
    };
  }, [chartTimeframe, assetIdsKey]);
  const tableChartsQuery = useGetScannerCharts(tableChartParams, {
    refetchIntervalMs,
  });
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId);
  const detailsChartQuery = useGetScannerAssetDetailsChart(selectedAssetId, {
    timeframe: chartTimeframe,
  });
  const tableChartSeriesRef = useRef<
    Map<number, (typeof filteredAssets)[number]["chart"]>
  >(new Map());
  const tableAssets = useMemo(() => {
    const incomingCharts = new Map(
      (tableChartsQuery.data?.assets ?? [])
        .filter((assetChart) => assetChart.status === "ok")
        .map((assetChart) => [
          assetChart.asset_id,
          mapScannerCandlesToOhlcv(
            assetChart.asset_id,
            assetChart.instrument_id,
            assetChart.candles,
          ),
        ]),
    );

    const nextChartSeriesByAssetId = new Map<
      number,
      (typeof filteredAssets)[number]["chart"]
    >();
    const nextAssets = filteredAssets.map((asset) => {
      if (asset.assetId === undefined) {
        return asset;
      }

      const mergedChart =
        incomingCharts.get(asset.assetId) ??
        tableChartSeriesRef.current.get(asset.assetId) ??
        asset.chart;

      nextChartSeriesByAssetId.set(asset.assetId, mergedChart);

      return {
        ...asset,
        instrumentId: mergedChart[0]?.instrument_id ?? asset.instrumentId,
        chart: mergedChart,
      };
    });

    tableChartSeriesRef.current = nextChartSeriesByAssetId;

    return nextAssets;
  }, [filteredAssets, tableChartsQuery.data]);
  const isMomentumPreset =
    preset === "Momentum Long" || preset === "Momentum Short";
  const marketStripItems = mapMarketStripResponse(marketStripQuery.data) ?? [];
  const panelAsset = useMemo(() => {
    if (!selectedAsset) return undefined;

    const detailsChart = detailsChartQuery.data;
    const chart =
      detailsChart && detailsChart.asset_id === selectedAsset.assetId
        ? mapScannerCandlesToOhlcv(
            detailsChart.asset_id,
            detailsChart.instrument_id,
            detailsChart.candles,
          )
        : undefined;

    return {
      ...mergeDetailsIntoAsset(selectedAsset, detailsQuery.data),
      instrumentId: detailsChart?.instrument_id ?? selectedAsset.instrumentId,
      chart: chart ?? selectedAsset.chart,
    };
  }, [detailsChartQuery.data, detailsQuery.data, selectedAsset]);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    if (isMobileScanner) {
      setMobilePanelOpen(true);
    }
  };

  const handleManualRefresh = () => {
    if (isManualRefreshing) {
      return;
    }

    setIsManualRefreshing(true);

    void Promise.all([
      ...(isMomentumPreset
        ? [momentumQuery.refetch()]
        : [scannerQuery.refetch()]),
      tableChartsQuery.refetch(),
      detailsQuery.refetch(),
      detailsChartQuery.refetch(),
      marketStripQuery.refetch(),
    ]).finally(() => {
      setIsManualRefreshing(false);
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="pb-8 pt-0 md:px-4">
        <div className="border-white/8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <ScannerMarketStrip
            breadth={marketStripQuery.data?.breadth}
            items={marketStripItems}
            updatedAt={marketStripQuery.data?.updated_at}
          />

          <div className="xl:flex xl:items-start">
            <div className="min-w-0 xl:flex-1 xl:border-r xl:border-white/8">
              <ScannerMomentumHeatmap
                selectedSymbol={selectedSymbol}
                onSelectSymbol={handleSelectSymbol}
              />

              <ScannerControls
                density={density}
                isManualRefreshing={isManualRefreshing}
                minVolume={minVolume}
                preset={preset}
                refreshInterval={refreshInterval}
                search={search}
                timeframe={timeframe}
                watchlistFilter={watchlistFilter}
                onDensityChange={setDensity}
                onManualRefresh={handleManualRefresh}
                onMinVolumeChange={setMinVolume}
                onPresetChange={setPreset}
                onRefreshIntervalChange={setRefreshInterval}
                onSearchChange={setSearch}
                onTimeframeChange={setTimeframe}
                onWatchlistFilterChange={setWatchlistFilter}
              />

              <section className="min-h-[900px]">
                <div
                  className={cn(
                    "border-b border-white/8 bg-[#0d0d0d] px-4 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
                    preset === "Momentum Long"
                      ? "text-[#5dc887]"
                      : preset === "Momentum Short"
                        ? "text-[#e35561]"
                        : "text-white/38",
                  )}
                >
                  {preset === "Momentum Long"
                    ? "Top Long Momentum"
                    : preset === "Momentum Short"
                      ? "Top Short Momentum"
                      : "% Movers"}
                </div>
                <ScannerTable
                  assets={tableAssets}
                  density={density}
                  preset={preset}
                  selectedSymbol={selectedSymbol}
                  sorting={sorting}
                  onSelectSymbol={handleSelectSymbol}
                  onSortingChange={setSorting}
                />
              </section>
            </div>

            <ScannerSidePanel
              asset={panelAsset}
              mobileOpen={isMobileScanner ? mobilePanelOpen : false}
              onMobileOpenChange={setMobilePanelOpen}
              timeframe={timeframe}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
