import type {
  MIN_VOLUME_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../../lib/scannerOptions";
import type {
  DensityMode,
  RefreshInterval,
  ScannerPreset,
  ScannerTimeframe,
} from "../../types";

export type ScannerControlsProps = {
  density: DensityMode;
  isRefreshing: boolean;
  minVolume: (typeof MIN_VOLUME_OPTIONS)[number];
  preset: ScannerPreset;
  refreshInterval: RefreshInterval;
  search: string;
  timeframe: ScannerTimeframe;
  watchlistFilter: (typeof WATCHLIST_OPTIONS)[number];
  onDensityChange: (value: DensityMode) => void;
  onManualRefresh: () => void;
  onMinVolumeChange: (value: (typeof MIN_VOLUME_OPTIONS)[number]) => void;
  onPresetChange: (value: ScannerPreset) => void;
  onRefreshIntervalChange: (value: RefreshInterval) => void;
  onSearchChange: (value: string) => void;
  onTimeframeChange: (value: ScannerTimeframe) => void;
  onWatchlistFilterChange: (value: (typeof WATCHLIST_OPTIONS)[number]) => void;
};
