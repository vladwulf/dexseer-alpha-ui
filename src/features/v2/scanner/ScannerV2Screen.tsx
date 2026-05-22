import { MARKET_STRIP } from "./data/mockScannerData";
import { useScannerState } from "./hooks/useScannerState";
import { ScannerControls } from "./components/ScannerControls";
import { ScannerMarketStrip } from "./components/ScannerMarketStrip";
import { ScannerSidePanel } from "./components/ScannerSidePanel";
import { ScannerTable } from "./components/ScannerTable";

export function ScannerV2Screen() {
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

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pb-8 pt-0 md:px-4">
        <div className="overflow-hidden border-white/8 bg-[#0a0a0a] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <ScannerMarketStrip items={MARKET_STRIP} />

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

          <section className="grid min-h-[900px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <ScannerTable
              assets={filteredAssets}
              density={density}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
            <ScannerSidePanel asset={selectedAsset} timeframe={timeframe} />
          </section>
        </div>
      </div>
    </div>
  );
}
