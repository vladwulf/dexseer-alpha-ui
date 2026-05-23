import { ActionButtons } from "./components/ActionButtons";
import { FilterDropdowns } from "./components/FilterDropdowns";
import { PresetChips } from "./components/PresetChips";
import { SearchField } from "./components/SearchField";
import { TimeframeChips } from "./components/TimeframeChips";
import type { ScannerControlsProps } from "./types";

export function ScannerControls({
  density,
  minVolume,
  preset,
  search,
  sortBy,
  timeframe,
  watchlistFilter,
  onDensityChange,
  onMinVolumeChange,
  onPresetChange,
  onSearchChange,
  onSortByChange,
  onTimeframeChange,
  onWatchlistFilterChange,
}: ScannerControlsProps) {
  return (
    <section className="sticky top-14 z-20 border-b border-white/8 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between 2xl:gap-4">
        <div className="flex justify-between">
          <div className="flex">
            <SearchField search={search} onSearchChange={onSearchChange} />
            <PresetChips preset={preset} onPresetChange={onPresetChange} />
          </div>
          <div>
            <TimeframeChips
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:gap-2">
          <div className="flex flex-wrap items-center gap-2 2xl:flex-nowrap">
            <FilterDropdowns
              minVolume={minVolume}
              sortBy={sortBy}
              watchlistFilter={watchlistFilter}
              onMinVolumeChange={onMinVolumeChange}
              onSortByChange={onSortByChange}
              onWatchlistFilterChange={onWatchlistFilterChange}
            />
          </div>

          <ActionButtons density={density} onDensityChange={onDensityChange} />
        </div>
      </div>
    </section>
  );
}
