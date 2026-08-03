import { useMemo, useState } from "react";
import { ActiveAssetPanel } from "./components/ActiveAssetPanel";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
import { TerminalWorkspace } from "./components/TerminalWorkspace";
import {
  useGetMarketStrip,
  useGetScannerAssetDetails,
  useGetScannerChart,
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
    selectedAsset,
    selectedSymbol,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
    scannerQuery,
  } = useScannerState({ refreshInterval });
  const chartTimeframe = getSupportedScannerChartTimeframe(timeframe);
  useLiveScannerFeed({ preset: "Classic Rolling" });
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId);
  const selectedChartQuery = useGetScannerChart(selectedAssetId, {
    timeframe: chartTimeframe,
    limit: 100,
  });
  const canSubscribeToSelectedChart =
    selectedChartQuery.isSuccess &&
    selectedChartQuery.data?.asset_id === selectedAssetId;
  const marketStripItems = mapMarketStripResponse(marketStripQuery.data) ?? [];
  const panelAsset = useMemo(() => {
    if (!selectedAsset) return undefined;

    const detailsChart = selectedChartQuery.data;
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
  }, [detailsQuery.data, selectedAsset, selectedChartQuery.data]);

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
      detailsQuery.refetch(),
      selectedChartQuery.refetch(),
      marketStripQuery.refetch(),
    ]).finally(() => {
      setIsManualRefreshing(false);
    });
  };

  return (
    <div className="terminal-screen">
      <div className="terminal-container">
        <div className="sticky top-11 z-40 bg-transparent">
          <ScannerMarketStrip
            breadth={marketStripQuery.data?.breadth}
            items={marketStripItems}
            updatedAt={marketStripQuery.data?.updated_at}
          />
        </div>
        <TerminalWorkspace
          controls={
            <ScannerControls
              density={density}
              isManualRefreshing={isManualRefreshing}
              minVolume={minVolume}
              refreshInterval={refreshInterval}
              timeframe={timeframe}
              watchlistFilter={watchlistFilter}
              onDensityChange={setDensity}
              onManualRefresh={handleManualRefresh}
              onMinVolumeChange={setMinVolume}
              onRefreshIntervalChange={setRefreshInterval}
              onTimeframeChange={setTimeframe}
              onWatchlistFilterChange={setWatchlistFilter}
            />
          }
          scanner={
            <>
              <div className="terminal-section-label text-white/38">
                % movers
              </div>
              <ScannerTable
                assets={filteredAssets}
                density={density}
                preset="Classic Rolling"
                selectedSymbol={selectedSymbol}
                sorting={sorting}
                onSelectSymbol={handleSelectSymbol}
                onSortingChange={setSorting}
              />
            </>
          }
          activeAsset={
            <ActiveAssetPanel
              asset={panelAsset}
              liveUpdatesEnabled={canSubscribeToSelectedChart}
              timeframe={timeframe}
            />
          }
          inspector={
            <ScannerSidePanel
              asset={panelAsset}
              liveUpdatesEnabled={canSubscribeToSelectedChart}
              mobileOpen={isMobileScanner ? mobilePanelOpen : false}
              onMobileOpenChange={setMobilePanelOpen}
              timeframe={timeframe}
            />
          }
        />
      </div>
    </div>
  );
}
