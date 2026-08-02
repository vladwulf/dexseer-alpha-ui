import { useCallback, useMemo, useRef, useState } from "react";
import {
  type AlertListItem,
  useLiveMomentumIntelligenceAlerts,
} from "@/features/alerts-explorer/hooks/alerts.api";
import { cn } from "@/lib/utils";
import { MomentumAlertsPanel } from "./components/MomentumAlertsPanel";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
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

const LAST_SEEN_ALERT_AT_STORAGE_KEY = "scanner-v2-last-seen-alert-at";

export function ScannerV2Screen() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<"manual" | "live">(
    "live",
  );
  const [unseenAlertsCount, setUnseenAlertsCount] = useState(0);
  const receivedAlertIdsRef = useRef(new Set<string>());
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
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId);
  const selectedChartQuery = useGetScannerChart(selectedAssetId, {
    timeframe: chartTimeframe,
    limit: 100,
  });
  const isMomentumPreset =
    preset === "Momentum Long" || preset === "Momentum Short";
  const isAlertsPreset = preset === "Alerts";
  const handleLiveAlert = useCallback(
    (alert: AlertListItem) => {
      if (receivedAlertIdsRef.current.has(alert.id)) return;
      receivedAlertIdsRef.current.add(alert.id);

      const alertAt = Date.parse(alert.triggered_at ?? alert.time);
      if (isAlertsPreset) {
        localStorage.setItem(
          LAST_SEEN_ALERT_AT_STORAGE_KEY,
          String(Number.isNaN(alertAt) ? Date.now() : alertAt),
        );
        return;
      }

      const lastSeenAt = Number(
        localStorage.getItem(LAST_SEEN_ALERT_AT_STORAGE_KEY),
      );
      if (!Number.isNaN(alertAt) && alertAt <= lastSeenAt) return;

      setUnseenAlertsCount((count) => count + 1);
    },
    [isAlertsPreset],
  );
  useLiveMomentumIntelligenceAlerts({ onAlertCreated: handleLiveAlert });
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

  const handlePresetChange = (nextPreset: typeof preset) => {
    setPreset(nextPreset);
    if (nextPreset !== "Alerts") return;

    localStorage.setItem(LAST_SEEN_ALERT_AT_STORAGE_KEY, String(Date.now()));
    setUnseenAlertsCount(0);
  };

  const handleManualRefresh = () => {
    if (isManualRefreshing) {
      return;
    }

    setIsManualRefreshing(true);

    void Promise.all([
      ...(isAlertsPreset
        ? []
        : isMomentumPreset
          ? [momentumQuery.refetch()]
          : [scannerQuery.refetch()]),
      detailsQuery.refetch(),
      selectedChartQuery.refetch(),
      marketStripQuery.refetch(),
    ]).finally(() => {
      setIsManualRefreshing(false);
    });
  };

  return (
    <>
      <div className="sticky top-11 z-40 bg-[#0d0d0d] shadow-2xl">
        <ScannerMarketStrip
          breadth={marketStripQuery.data?.breadth}
          items={marketStripItems}
          updatedAt={marketStripQuery.data?.updated_at}
        />
      </div>
      <div className="pt-5 text-white container mx-auto max-w-[1920px]">
        <div className="pt-0 pb-8 md:px-4">
          <div className="border-white/8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="xl:flex xl:items-start">
              <div className="min-w-0 xl:flex-1 xl:border-r xl:border-white/8">
                <ScannerControls
                  density={density}
                  isManualRefreshing={isManualRefreshing}
                  minVolume={minVolume}
                  preset={preset}
                  refreshInterval={refreshInterval}
                  search={search}
                  timeframe={timeframe}
                  unseenAlertsCount={unseenAlertsCount}
                  watchlistFilter={watchlistFilter}
                  onDensityChange={setDensity}
                  onManualRefresh={handleManualRefresh}
                  onMinVolumeChange={setMinVolume}
                  onPresetChange={handlePresetChange}
                  onRefreshIntervalChange={setRefreshInterval}
                  onSearchChange={setSearch}
                  onTimeframeChange={setTimeframe}
                  onWatchlistFilterChange={setWatchlistFilter}
                />

                {isAlertsPreset ? (
                  <MomentumAlertsPanel />
                ) : (
                  <section>
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
                      assets={filteredAssets}
                      density={density}
                      preset={preset}
                      selectedSymbol={selectedSymbol}
                      sorting={sorting}
                      onSelectSymbol={handleSelectSymbol}
                      onSortingChange={setSorting}
                    />
                  </section>
                )}
              </div>

              {!isAlertsPreset && (
                <ScannerSidePanel
                  asset={panelAsset}
                  mobileOpen={isMobileScanner ? mobilePanelOpen : false}
                  onMobileOpenChange={setMobilePanelOpen}
                  timeframe={timeframe}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
