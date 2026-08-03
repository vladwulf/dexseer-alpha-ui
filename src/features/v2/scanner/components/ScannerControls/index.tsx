import { ActionButtons } from "./components/ActionButtons";
import { TimeframeChips } from "./components/TimeframeChips";
import type { ScannerControlsProps } from "./types";

export function ScannerControls({
  density,
  isManualRefreshing,
  minVolume: _minVolume,
  refreshInterval,
  timeframe,
  watchlistFilter: _watchlistFilter,
  onDensityChange,
  onManualRefresh,
  onMinVolumeChange: _onMinVolumeChange,
  onRefreshIntervalChange,
  onTimeframeChange,
  onWatchlistFilterChange: _onWatchlistFilterChange,
}: ScannerControlsProps) {
  const actionButtons = (
    <ActionButtons
      density={density}
      isRefreshing={isManualRefreshing}
      refreshInterval={refreshInterval}
      onDensityChange={onDensityChange}
      onManualRefresh={onManualRefresh}
      onRefreshIntervalChange={onRefreshIntervalChange}
    />
  );

  return (
    <section className="border-b border-white/7 bg-[#0a0a0a]/95 px-4 py-3 md:px-6">
      {/* Mobile layout (< md): stacked rows */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center justify-between gap-2">
          {actionButtons}
        </div>
        <TimeframeChips
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
        />
      </div>

      {/* Desktop layout (md+): single row */}
      <div className="hidden md:flex md:items-center md:gap-4">
        <div className="ml-auto flex items-center gap-3">
          <TimeframeChips
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
          />
          {actionButtons}
        </div>
      </div>
    </section>
  );
}
