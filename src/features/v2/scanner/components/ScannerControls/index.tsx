import { ActionButtons } from "./components/ActionButtons";
import { PresetChips } from "./components/PresetChips";
import { SearchField } from "./components/SearchField";
import { TimeframeChips } from "./components/TimeframeChips";
import type { ScannerControlsProps } from "./types";

export function ScannerControls({
  density,
  minVolume: _minVolume,
  preset,
  search,
  timeframe,
  watchlistFilter: _watchlistFilter,
  onDensityChange,
  onMinVolumeChange: _onMinVolumeChange,
  onPresetChange,
  onSearchChange,
  onTimeframeChange,
  onWatchlistFilterChange: _onWatchlistFilterChange,
}: ScannerControlsProps) {
  return (
    <section className="sticky top-14 z-20 border-b border-white/7 bg-[#0a0a0a]/95 px-4 py-2.5 backdrop-blur md:px-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <SearchField search={search} onSearchChange={onSearchChange} />
            <PresetChips preset={preset} onPresetChange={onPresetChange} />
          </div>
          <div className="flex items-center gap-2">
            <TimeframeChips
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
            />
            <ActionButtons
              density={density}
              onDensityChange={onDensityChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 2xl:flex-row 2xl:items-center 2xl:gap-2">
          {/* <div className="flex flex-wrap items-center gap-2 2xl:flex-nowrap">
            <FilterDropdowns
              minVolume={minVolume}
              sortBy={sortBy}
              watchlistFilter={watchlistFilter}
              onMinVolumeChange={onMinVolumeChange}
              onSortByChange={onSortByChange}
              onWatchlistFilterChange={onWatchlistFilterChange}
            />
          </div> */}
        </div>
      </div>
    </section>
  );
}
