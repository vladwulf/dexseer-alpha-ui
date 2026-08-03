import type {
  MIN_VOLUME_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../../lib/scannerOptions";
import type {
  DensityMode,
  RefreshInterval,
  ScannerTimeframe,
} from "../../types";

export type ScannerControlsProps = {
  density: DensityMode;
  isManualRefreshing: boolean;
  minVolume: (typeof MIN_VOLUME_OPTIONS)[number];
  refreshInterval: RefreshInterval;
  timeframe: ScannerTimeframe;
  watchlistFilter: (typeof WATCHLIST_OPTIONS)[number];
  onDensityChange: (value: DensityMode) => void;
  onManualRefresh: () => void;
  onMinVolumeChange: (value: (typeof MIN_VOLUME_OPTIONS)[number]) => void;
  onRefreshIntervalChange: (value: RefreshInterval) => void;
  onTimeframeChange: (value: ScannerTimeframe) => void;
  onWatchlistFilterChange: (value: (typeof WATCHLIST_OPTIONS)[number]) => void;
};
