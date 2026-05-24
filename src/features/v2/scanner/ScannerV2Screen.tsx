import { useState } from "react";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerMomentumHeatmap } from "./components/ScannerMomentumHeatmap";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";
import { MARKET_STRIP } from "./data/mockScannerData";
import { useIsMobileScanner } from "./hooks/useIsMobileScanner";
import { useScannerState } from "./hooks/useScannerState";

export function ScannerV2Screen() {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const isMobileScanner = useIsMobileScanner();
  const {
    density,
    filteredAssets,
    minVolume,
    preset,
    search,
    selectedAsset,
    selectedSymbol,
    sortBy,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setPreset,
    setSearch,
    setSelectedSymbol,
    setSortBy,
    setTimeframe,
    setWatchlistFilter,
  } = useScannerState();

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
          <ScannerMarketStrip items={MARKET_STRIP} />
          <ScannerMomentumHeatmap
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSelectSymbol}
          />

          <ScannerControls
            density={density}
            minVolume={minVolume}
            preset={preset}
            search={search}
            sortBy={sortBy}
            timeframe={timeframe}
            watchlistFilter={watchlistFilter}
            onDensityChange={setDensity}
            onMinVolumeChange={setMinVolume}
            onPresetChange={setPreset}
            onSearchChange={setSearch}
            onSortByChange={setSortBy}
            onTimeframeChange={setTimeframe}
            onWatchlistFilterChange={setWatchlistFilter}
          />

          <section className="min-h-[900px] xl:flex">
            <ScannerTable
              assets={filteredAssets}
              density={density}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={handleSelectSymbol}
            />
            <ScannerSidePanel
              asset={selectedAsset}
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
