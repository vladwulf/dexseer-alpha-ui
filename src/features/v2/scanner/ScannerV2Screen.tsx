import { useMemo, useRef, useState } from "react";
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
  mergePolledChartSeries,
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
      limit: 40,
    };
  }, [chartTimeframe, assetIdsKey]);
  const tableChartsQuery = useGetScannerCharts(tableChartParams, {
    refetchIntervalMs,
  });
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId);
  const detailsChartQuery = useGetScannerAssetDetailsChart(
    selectedAssetId,
    {
      timeframe: chartTimeframe,
    },
    {
      refetchIntervalMs,
    },
  );
  const tableChartSeriesRef = useRef<
    Map<number, (typeof filteredAssets)[number]["chart"]>
  >(new Map());
  const tableAssets = useMemo(() => {
    const incomingCharts = new Map(
      (tableChartsQuery.data?.assets ?? [])
        .filter((assetChart) => assetChart.status === "ok")
        .map((assetChart) => [
          assetChart.asset_id,
          mapScannerCandlesToOhlcv(assetChart.asset_id, assetChart.candles),
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

      const mergedChart = mergePolledChartSeries(
        tableChartSeriesRef.current.get(asset.assetId),
        incomingCharts.get(asset.assetId),
      );

      nextChartSeriesByAssetId.set(asset.assetId, mergedChart);

      return {
        ...asset,
        chart: mergedChart,
      };
    });

    tableChartSeriesRef.current = nextChartSeriesByAssetId;

    return nextAssets;
  }, [filteredAssets, tableChartsQuery.data]);
  const marketStripItems = mapMarketStripResponse(marketStripQuery.data) ?? [];
  const panelAsset = useMemo(() => {
    if (!selectedAsset) return undefined;

    const detailsChart = detailsChartQuery.data;
    const chart =
      detailsChart && detailsChart.asset_id === selectedAsset.assetId
        ? mapScannerCandlesToOhlcv(detailsChart.asset_id, detailsChart.candles)
        : undefined;

    return {
      ...mergeDetailsIntoAsset(selectedAsset, detailsQuery.data),
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
      scannerQuery.refetch(),
      tableChartsQuery.refetch(),
      detailsQuery.refetch(),
      detailsChartQuery.refetch(),
      marketStripQuery.refetch(),
    ]).finally(() => {
      setIsManualRefreshing(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pb-8 pt-0 md:px-4">
        <div className="overflow-hidden border-white/8 bg-[#0a0a0a] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <ScannerMarketStrip
            breadth={marketStripQuery.data?.breadth}
            items={marketStripItems}
            updatedAt={marketStripQuery.data?.updated_at}
          />
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

          <section className="min-h-[900px] xl:flex">
            <ScannerTable
              assets={tableAssets}
              density={density}
              preset={preset}
              selectedSymbol={selectedSymbol}
              sorting={sorting}
              onSelectSymbol={handleSelectSymbol}
              onSortingChange={setSorting}
            />
            <ScannerSidePanel
              asset={panelAsset}
              mobileOpen={isMobileScanner ? mobilePanelOpen : false}
              onMobileOpenChange={setMobilePanelOpen}
              timeframe={timeframe}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
