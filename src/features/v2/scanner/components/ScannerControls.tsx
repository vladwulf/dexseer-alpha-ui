import type { CSSProperties } from "react";
import { ChevronDown, Filter, Search, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  MIN_VOLUME_OPTIONS,
  PRESET_OPTIONS,
  SORT_OPTIONS,
  TIMEFRAME_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../data/mockScannerData";
import type { DensityMode, ScannerPreset, ScannerTimeframe, SortOption } from "../types";

const chipBase: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.05em",
  padding: "3px 9px",
  borderRadius: "4px",
  cursor: "pointer",
  border: "1px solid transparent",
  transition: "all 0.12s",
  background: "transparent",
  color: "oklch(0.48 0 0)",
};

const chipActive: CSSProperties = {
  ...chipBase,
  color: "oklch(0.72 0.18 248)",
  background: "oklch(0.72 0.18 248 / 12%)",
  border: "1px solid oklch(0.72 0.18 248 / 30%)",
};

const chipDropdown: CSSProperties = {
  ...chipBase,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

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

          <div className="flex flex-wrap items-center gap-0.5">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onPresetChange(option)}
                style={preset === option ? chipActive : chipBase}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-0.5">
              {TIMEFRAME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onTimeframeChange(option)}
                  style={timeframe === option ? chipActive : chipBase}
                >
                  {option}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" style={chipDropdown}>
                  {watchlistFilter}
                  <ChevronDown size={11} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={watchlistFilter}
                  onValueChange={(v) => onWatchlistFilterChange(v as (typeof WATCHLIST_OPTIONS)[number])}
                >
                  {WATCHLIST_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={option}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" style={chipDropdown}>
                  Vol {minVolume}
                  <ChevronDown size={11} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={minVolume}
                  onValueChange={(v) => onMinVolumeChange(v as (typeof MIN_VOLUME_OPTIONS)[number])}
                >
                  {MIN_VOLUME_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={option}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" style={chipDropdown}>
                  {sortBy}
                  <ChevronDown size={11} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => onSortByChange(v as SortOption)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={option}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-0.5">
            <button
              type="button"
              onClick={() => onDensityChange("compact")}
              style={density === "compact" ? chipActive : chipBase}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => onDensityChange("expanded")}
              style={density === "expanded" ? chipActive : chipBase}
            >
              Expanded
            </button>
            <button
              type="button"
              style={{
                ...chipBase,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                border: "1px solid oklch(1 0 0 / 10%)",
              }}
            >
              <Filter size={12} />
              Filters
            </button>
            <button
              type="button"
              style={{
                ...chipActive,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Star size={12} />
              Save view
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
