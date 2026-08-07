import { Keyboard } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActiveAssetPanel } from "./components/ActiveAssetPanel";
import { ScannerColumnCustomizer } from "./components/ScannerColumnCustomizer";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
import { TerminalWorkspace } from "./components/TerminalWorkspace";
import {
  useGetMarketStrip,
  useGetScannerAssetDetails,
  useGetScannerChartHistory,
} from "./hooks/scanner.api";
import { useIsMobileScanner } from "./hooks/useIsMobileScanner";
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
    columnOrder,
    density,
    filteredAssets,
    minVolume,
    selectedAsset,
    selectedSymbol,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setColumnOrder,
    setMinVolume,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
    scannerQuery,
  } = useScannerState({ refreshInterval });
  const chartTimeframe = getSupportedScannerChartTimeframe(timeframe);
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId, {
    refetchIntervalMs: refreshInterval === "live" ? 5_000 : false,
  });
  const selectedChartQuery = useGetScannerChartHistory(selectedAssetId, {
    timeframe: chartTimeframe,
    limit: 500,
  });
  const canSubscribeToSelectedChart =
    selectedChartQuery.isSuccess &&
    selectedChartQuery.data?.pages[0]?.asset_id === selectedAssetId;
  const marketStripItems = mapMarketStripResponse(marketStripQuery.data) ?? [];
  const panelAsset = useMemo(() => {
    if (!selectedAsset) return undefined;

    const chartPages = selectedChartQuery.data?.pages ?? [];
    const detailsChart = chartPages[0];
    const chartByTime = new Map(
      chartPages
        .flatMap((page) =>
          page.asset_id === selectedAsset.assetId
            ? mapScannerCandlesToOhlcv(
                page.asset_id,
                page.instrument_id,
                page.candles,
              )
            : [],
        )
        .map((candle) => [candle.time, candle] as const),
    );
    const chart = [...chartByTime.values()].sort((left, right) =>
      left.time.localeCompare(right.time),
    );

    return {
      ...mergeDetailsIntoAsset(selectedAsset, detailsQuery.data),
      instrumentId: detailsChart?.instrument_id ?? selectedAsset.instrumentId,
      chart: chart.length > 0 ? chart : selectedAsset.chart,
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
        <div className="z-40 bg-transparent">
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
              <div className="terminal-section-label">
                <div className="flex items-center gap-2">
                  <span className="text-white/38">Movers</span>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          aria-label="Arrow key navigation"
                          className="flex size-5 items-center justify-center rounded text-white/30 transition-colors hover:bg-white/6 hover:text-white/65 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                          type="button"
                        >
                          <Keyboard aria-hidden="true" className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Use ↑ ↓ ← → to switch assets
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ScannerColumnCustomizer
                  columnOrder={columnOrder}
                  onColumnOrderChange={setColumnOrder}
                />
              </div>
              <ScannerTable
                assets={filteredAssets}
                columnOrder={columnOrder}
                density={density}
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
              hasMoreChartHistory={selectedChartQuery.hasNextPage}
              isLoadingMoreChartHistory={selectedChartQuery.isFetchingNextPage}
              liveUpdatesEnabled={canSubscribeToSelectedChart}
              mobileOpen={isMobileScanner ? mobilePanelOpen : false}
              onLoadMoreChartHistory={() => {
                void selectedChartQuery.fetchNextPage();
              }}
              onMobileOpenChange={setMobilePanelOpen}
              timeframe={timeframe}
            />
          }
          showInspector
        />
      </div>
    </div>
  );
}
