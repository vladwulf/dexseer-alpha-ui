import type {
  MIN_VOLUME_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../../data/mockScannerData";
import type {
  DensityMode,
  ScannerPreset,
  ScannerTimeframe,
  SortOption,
} from "../../types";

export type ScannerControlsProps = {
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
