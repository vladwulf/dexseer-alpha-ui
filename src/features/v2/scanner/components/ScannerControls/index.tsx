import { Input } from "@/components/ui/input";
import { ActionButtons } from "./components/ActionButtons";
import { TimeframeChips } from "./components/TimeframeChips";
import type { ScannerControlsProps } from "./types";

export function ScannerControls({
  assetFilter,
  density,
  isManualRefreshing,
  minVolume: _minVolume,
  refreshInterval,
  timeframe,
  watchlistFilter: _watchlistFilter,
  onDensityChange,
  onAssetFilterChange,
  onManualRefresh,
  onMinVolumeChange: _onMinVolumeChange,
  onRefreshIntervalChange,
  onTimeframeChange,
  onWatchlistFilterChange: _onWatchlistFilterChange,
}: ScannerControlsProps) {
  const assetFilterInput = (
    <div className="flex w-full items-center gap-2 md:w-auto">
      <span className="shrink-0 whitespace-nowrap font-mono text-[0.58rem] tracking-[0.12em] uppercase text-[var(--ds-text-tertiary)]">
        Asset
      </span>
      <Input
        aria-label="Filter assets"
        className="!h-9 !w-full !rounded-[4px] border-[var(--ds-border)] bg-[var(--ds-canvas-raised)] px-2 !py-1 font-mono !text-[11px] !leading-none font-medium tracking-[0.05em] text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-tertiary)] hover:border-[var(--ds-border-strong)] focus-visible:border-[var(--ds-electric)] focus-visible:ring-1 focus-visible:ring-[var(--ds-electric)] md:!h-[26px] md:!w-40"
        placeholder="Search symbol"
        value={assetFilter}
        onChange={(event) => onAssetFilterChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
      />
    </div>
  );

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
        <div className="flex items-center justify-end gap-2">
          {actionButtons}
        </div>
        {assetFilterInput}
        <TimeframeChips
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
        />
      </div>

      {/* Desktop layout (md+): single row */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        {assetFilterInput}
        <div className="flex items-center gap-3">
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
