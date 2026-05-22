import { Filter, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MIN_VOLUME_OPTIONS,
  PRESET_OPTIONS,
  SORT_OPTIONS,
  TIMEFRAME_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../data/mockScannerData";
import type { DensityMode, ScannerPreset, ScannerTimeframe, SortOption } from "../types";

type ScannerControlsProps = {
  density: DensityMode;
  minVolume: (typeof MIN_VOLUME_OPTIONS)[number];
  preset: ScannerPreset;
  search: string;
  sortBy: SortOption;
  timeframe: ScannerTimeframe;
  watchlistFilter: (typeof WATCHLIST_OPTIONS)[number];
  onDensityChange: (value: DensityMode) => void;
  onMinVolumeChange: (value: (typeof MIN_VOLUME_OPTIONS)[number]) => void;
  onPresetChange: (value: ScannerPreset) => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortOption) => void;
  onTimeframeChange: (value: ScannerTimeframe) => void;
  onWatchlistFilterChange: (value: (typeof WATCHLIST_OPTIONS)[number]) => void;
};

export function ScannerControls(props: ScannerControlsProps) {
  const {
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
  } = props;

  return (
    <section className="sticky top-14 z-20 border-b border-white/8 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex max-w-[320px] items-center gap-2 rounded-2xl">
            <Search className="h-4 w-4 text-white/35" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="search symbol..."
              className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {PRESET_OPTIONS.map((option) => (
              <Button
                key={option}
                onClick={() => onPresetChange(option)}
                variant="outline"
                size="sm"
                className={`rounded-full font-[var(--font-display)] text-[0.78rem] transition ${
                  preset === option
                    ? "border-[#5b8ff9] bg-[rgba(91,143,249,0.14)] text-white/90"
                    : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TIMEFRAME_OPTIONS.map((option) => (
              <Button
                key={option}
                onClick={() => onTimeframeChange(option)}
                variant="outline"
                size="sm"
                className={`min-w-14 rounded-2xl text-[0.78rem] font-semibold ${
                  timeframe === option
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/72"
                }`}
              >
                {option}
              </Button>
            ))}

            <select
              value={watchlistFilter}
              onChange={(event) =>
                onWatchlistFilterChange(event.target.value as (typeof WATCHLIST_OPTIONS)[number])
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.78rem] text-white/80 outline-none"
            >
              {WATCHLIST_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <select
              value={minVolume}
              onChange={(event) =>
                onMinVolumeChange(event.target.value as (typeof MIN_VOLUME_OPTIONS)[number])
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.78rem] text-white/80 outline-none"
            >
              {MIN_VOLUME_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortOption)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.78rem] text-white/80 outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDensityChange("compact")}
              className={`rounded-full text-[0.78rem] font-semibold ${
                density === "compact"
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/72"
              }`}
            >
              Compact
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDensityChange("expanded")}
              className={`rounded-full text-[0.78rem] font-semibold ${
                density === "expanded"
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/72"
              }`}
            >
              Expanded
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-white/[0.03] text-[0.78rem] text-white/78"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-[rgba(91,143,249,0.35)] bg-[rgba(91,143,249,0.12)] text-[0.78rem] text-white/90"
            >
              <Star className="h-4 w-4" />
              Save view
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
