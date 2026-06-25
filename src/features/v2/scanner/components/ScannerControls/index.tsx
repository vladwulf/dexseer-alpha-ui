import { ActionButtons } from "./components/ActionButtons";
import { SearchField } from "./components/SearchField";
import { TimeframeChips } from "./components/TimeframeChips";
import type { ScannerControlsProps } from "./types";

const PRESET_CHIPS = [
  { value: "Classic Rolling", label: "Movers" },
  { value: "Momentum Long", label: "Momentum Long" },
  { value: "Momentum Short", label: "Momentum Short" },
] as const;

export function ScannerControls({
  density,
  isManualRefreshing,
  minVolume: _minVolume,
  preset,
  refreshInterval,
  search,
  timeframe,
  watchlistFilter: _watchlistFilter,
  onDensityChange,
  onManualRefresh,
  onMinVolumeChange: _onMinVolumeChange,
  onPresetChange,
  onRefreshIntervalChange,
  onSearchChange,
  onTimeframeChange,
  onWatchlistFilterChange: _onWatchlistFilterChange,
}: ScannerControlsProps) {
  return (
    <section className="border-b border-white/7 bg-[#0a0a0a]/95 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <SearchField search={search} onSearchChange={onSearchChange} />
          <div className="flex items-center gap-1.5">
            {PRESET_CHIPS.map(({ value, label }) => {
              const isActive = preset === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPresetChange(value)}
                  className={`h-7 rounded-full border px-3 text-[0.7rem] font-bold transition-all duration-150 ${
                    isActive
                      ? value === "Classic Rolling"
                        ? "border-transparent bg-[#5dc887] text-[#040a06]"
                        : value === "Momentum Long"
                          ? "border-[rgba(93,200,135,0.35)] bg-[rgba(93,200,135,0.15)] text-[#5dc887]"
                          : "border-[rgba(227,85,97,0.35)] bg-[rgba(227,85,97,0.15)] text-[#e35561]"
                      : "border-white/10 bg-white/[0.035] text-white/50 hover:border-white/18 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TimeframeChips
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
          />
          <ActionButtons
            density={density}
            isRefreshing={isManualRefreshing}
            refreshInterval={refreshInterval}
            onDensityChange={onDensityChange}
            onManualRefresh={onManualRefresh}
            onRefreshIntervalChange={onRefreshIntervalChange}
          />
        </div>
      </div>
    </section>
  );
}
