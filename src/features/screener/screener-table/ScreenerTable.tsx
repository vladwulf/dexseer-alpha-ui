import { useState } from "react";
import type { SortingState, Updater } from "@tanstack/react-table";
import { SortBy, useGetAssets } from "../hooks/screener.api";
import type { ScreenerAssetWithChart } from "../types";
import { getCryptoColumns } from "./columns";
import { DataTable } from "./data-table";
import {
  ScreenerConfigs,
  type ScreenerDensity,
  type RefreshInterval,
  type Timeframe,
} from "../screener-buttons/ScreenerConfigs";

/**
 * Maps TanStack Table column accessor keys to backend SortBy values
 */
const columnToSortByMap: Record<string, SortBy> = {
  price: SortBy.PRICE,
  change_1m: SortBy.ONE_MIN_PERFORMANCE,
  change_5m: SortBy.FIVE_MIN_PERFORMANCE,
  change_15m: SortBy.FIFTEEN_MIN_PERFORMANCE,
  change_1h: SortBy.ONE_HOUR_PERFORMANCE,
  change_4h: SortBy.FOUR_HOUR_PERFORMANCE,
  volume_delta_1m: SortBy.ONE_MIN_VOLUME_DELTA,
  volume_delta_5m: SortBy.FIVE_MIN_VOLUME_DELTA,
  volume_delta_1h: SortBy.ONE_HOUR_VOLUME_DELTA,
  volume_delta_4h: SortBy.FOUR_HOUR_VOLUME_DELTA,
};

/**
 * Converts TanStack Table sorting state to backend SortBy value and direction
 */
const getSortParamsFromSorting = (
  sorting: SortingState,
): { sortBy: SortBy; direction: "asc" | "desc" } => {
  if (sorting.length === 0) {
    return {
      sortBy: SortBy.FOUR_HOUR_PERFORMANCE, // Default sort
      direction: "desc", // Default direction
    };
  }
  const firstSort = sorting[0];
  const sortBy =
    columnToSortByMap[firstSort.id] ?? SortBy.FOUR_HOUR_PERFORMANCE;
  const direction = firstSort.desc ? "desc" : "asc";
  return { sortBy, direction };
};

export const ScreenerTable = () => {
  // Initialize with default sort: 4h performance descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: "change_4h", desc: true },
  ]);
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [assetNameFilter, setAssetNameFilter] = useState("");
  const [refreshInterval, setRefreshInterval] =
    useState<RefreshInterval>("manual");
  const [density, setDensity] = useState<ScreenerDensity>("compact");
  const { sortBy, direction } = getSortParamsFromSorting(sorting);
  const columns = getCryptoColumns(density);

  const refreshIntervalMs: number | false =
    refreshInterval === "manual"
      ? false
      : refreshInterval === "5s"
        ? 5000
        : refreshInterval === "10s"
          ? 10000
          : refreshInterval === "30s"
            ? 30000
            : refreshInterval === "1m"
              ? 60000
              : 300000;

  const {
    data: assets,
    refetch,
    isFetching,
  } = useGetAssets({
    sortBy,
    direction,
    chartTimeframe: timeframe,
    assetName: assetNameFilter,
    refetchIntervalMs: refreshIntervalMs,
  });

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    setSorting((old) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(old)
          : updaterOrValue;
      return newSorting;
    });
  };

  return (
    <div className="px-4">
      <ScreenerConfigs
        timeframe={timeframe}
        refreshInterval={refreshInterval}
        density={density}
        assetNameFilter={assetNameFilter}
        isRefreshing={isFetching}
        onTimeframeChange={setTimeframe}
        onRefreshIntervalChange={setRefreshInterval}
        onDensityChange={setDensity}
        onAssetNameFilterChange={setAssetNameFilter}
        onManualRefresh={() => {
          void refetch();
        }}
      />
      <div className="mt-10">
        <DataTable<ScreenerAssetWithChart, unknown>
          columns={columns}
          data={assets || []}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          density={density}
          hideHeader={density === "extended"}
        />
      </div>
    </div>
  );
};
