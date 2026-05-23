import {
  MIN_VOLUME_OPTIONS,
  SORT_OPTIONS,
  WATCHLIST_OPTIONS,
} from "../../../data/mockScannerData";
import type { SortOption } from "../../../types";
import { OptionDropdown } from "./OptionDropdown";

type FilterDropdownsProps = {
  minVolume: (typeof MIN_VOLUME_OPTIONS)[number];
  sortBy: SortOption;
  watchlistFilter: (typeof WATCHLIST_OPTIONS)[number];
  onMinVolumeChange: (value: (typeof MIN_VOLUME_OPTIONS)[number]) => void;
  onSortByChange: (value: SortOption) => void;
  onWatchlistFilterChange: (value: (typeof WATCHLIST_OPTIONS)[number]) => void;
};

export function FilterDropdowns({
  minVolume,
  sortBy,
  watchlistFilter,
  onMinVolumeChange,
  onSortByChange,
  onWatchlistFilterChange,
}: FilterDropdownsProps) {
  return (
    <>
      <OptionDropdown
        label={watchlistFilter}
        options={WATCHLIST_OPTIONS}
        value={watchlistFilter}
        onValueChange={onWatchlistFilterChange}
      />
      <OptionDropdown
        label={`Vol ${minVolume}`}
        options={MIN_VOLUME_OPTIONS}
        value={minVolume}
        onValueChange={onMinVolumeChange}
      />
      <OptionDropdown
        label={sortBy}
        options={SORT_OPTIONS}
        value={sortBy}
        onValueChange={onSortByChange}
      />
    </>
  );
}
