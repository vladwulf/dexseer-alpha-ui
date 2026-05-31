import { useMemo, useState } from "react";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerMomentumHeatmap } from "./components/ScannerMomentumHeatmap";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
import { MARKET_STRIP } from "./data/mockScannerData";
import {
  useGetMarketStrip,
  useGetScannerAssetDetails,
  useGetScannerAssetDetailsChart,
  useGetScannerCharts,
} from "./hooks/scanner.api";
import { useIsMobileScanner } from "./hooks/useIsMobileScanner";
import { useScannerState } from "./hooks/useScannerState";
import {
  getSupportedScannerChartTimeframe,
  mapMarketStripResponse,
  mergeBatchChartsIntoAssets,
  mergeChartIntoAsset,
  mergeDetailsIntoAsset,
} from "./lib/apiAdapters";

export function ScannerV2Screen() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
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
  } = useScannerState();
  const tableChartParams = useMemo(() => {
    const assetIds = filteredAssets
      .map((asset) => asset.assetId)
      .filter((assetId): assetId is number => assetId !== undefined);

    if (assetIds.length === 0) {
      return null;
    }

    return {
      asset_ids: assetIds.join(","),
      timeframe: getSupportedScannerChartTimeframe(timeframe),
      limit: 40,
    };
  }, [filteredAssets, timeframe]);
  const tableChartsQuery = useGetScannerCharts(tableChartParams);
  const tableAssets = useMemo(
    () => mergeBatchChartsIntoAssets(filteredAssets, tableChartsQuery.data),
    [filteredAssets, tableChartsQuery.data],
  );
  const selectedAssetId = selectedAsset?.assetId;
  const detailsQuery = useGetScannerAssetDetails(selectedAssetId);
  const detailsChartQuery = useGetScannerAssetDetailsChart(selectedAssetId, {
    timeframe: getSupportedScannerChartTimeframe(timeframe),
  });
  const marketStripItems =
    mapMarketStripResponse(marketStripQuery.data) ?? MARKET_STRIP;
  const panelAsset = useMemo(() => {
    if (!selectedAsset) return undefined;

    return mergeChartIntoAsset(
      mergeDetailsIntoAsset(selectedAsset, detailsQuery.data),
      detailsChartQuery.data,
    );
  }, [detailsChartQuery.data, detailsQuery.data, selectedAsset]);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    if (isMobileScanner) {
      setMobilePanelOpen(true);
    }
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
            minVolume={minVolume}
            preset={preset}
            search={search}
            timeframe={timeframe}
            watchlistFilter={watchlistFilter}
            onDensityChange={setDensity}
            onMinVolumeChange={setMinVolume}
            onPresetChange={setPreset}
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
