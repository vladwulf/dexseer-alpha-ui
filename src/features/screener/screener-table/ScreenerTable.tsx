import type { SortingState, Updater } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import { SortBy, useGetAssets } from "../hooks/screener.api";
import {
  type RefreshInterval,
  ScreenerConfigs,
  type ScreenerDensity,
  type ScreenerProfile,
  type Timeframe,
} from "../screener-buttons/ScreenerConfigs";
import type { ScreenerAssetWithChart } from "../types";
import { getCryptoColumns } from "./columns";
import { DataTable } from "./data-table";

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
  change_1d: SortBy.ONE_DAY_PERFORMANCE,
  volume_1d: SortBy.ONE_DAY_VOLUME,
  volume_delta_1m: SortBy.ONE_MIN_VOLUME_DELTA,
  volume_delta_5m: SortBy.FIVE_MIN_VOLUME_DELTA,
  volume_delta_1h: SortBy.ONE_HOUR_VOLUME_DELTA,
  volume_delta_4h: SortBy.FOUR_HOUR_VOLUME_DELTA,
  volume_delta_1d: SortBy.ONE_DAY_VOLUME_DELTA,
};

const DAY_PROFILE_SORTABLE_COLUMNS = new Set([
  "price",
  "change_1m",
  "change_5m",
  "change_15m",
  "change_1h",
  "volume_delta_1m",
  "volume_delta_5m",
  "volume_delta_1h",
]);

const SWING_PROFILE_SORTABLE_COLUMNS = new Set([
  "price",
  "change_1h",
  "change_4h",
  "change_1d",
  "volume_1d",
  "volume_delta_1h",
  "volume_delta_4h",
  "volume_delta_1d",
]);

const MULTI_TIMEFRAME_SORTABLE_COLUMNS = new Set([
  "price",
  "change_1m",
  "change_5m",
  "change_15m",
  "change_1h",
  "change_4h",
  "change_1d",
  "volume_1d",
  "volume_delta_1m",
  "volume_delta_5m",
  "volume_delta_1h",
  "volume_delta_4h",
  "volume_delta_1d",
]);

const getDefaultSortingForProfile = (profile: ScreenerProfile): SortingState =>
  profile === "swing-trading"
    ? [{ id: "change_1d", desc: true }]
    : profile === "day-trading"
      ? [{ id: "change_15m", desc: true }]
      : [{ id: "change_4h", desc: true }];

const isSortingVisibleForProfile = (
  sorting: SortingState,
  profile: ScreenerProfile,
) => {
  if (sorting.length === 0) {
    return false;
  }

  const visibleColumns =
    profile === "swing-trading"
      ? SWING_PROFILE_SORTABLE_COLUMNS
      : profile === "day-trading"
        ? DAY_PROFILE_SORTABLE_COLUMNS
        : MULTI_TIMEFRAME_SORTABLE_COLUMNS;

  return visibleColumns.has(sorting[0].id);
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
  const [sorting, setSorting] = useState<SortingState>(
    getDefaultSortingForProfile("multi-timeframe"),
  );
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [profile, setProfile] = useState<ScreenerProfile>("multi-timeframe");
  const [assetNameFilter, setAssetNameFilter] = useState("");
  const [refreshInterval, setRefreshInterval] =
    useState<RefreshInterval>("live");
  const [density, setDensity] = useState<ScreenerDensity>("compact");
  const { sortBy, direction } = getSortParamsFromSorting(sorting);
  const columns = getCryptoColumns(density, profile);

  const {
    data: assets,
    refetch,
    isFetching,
  } = useGetAssets({
    sortBy,
    direction,
    chartTimeframe: timeframe,
    assetName: assetNameFilter,
    refetchIntervalMs: 5000,
  });
  const seeds = useMemo(
    () =>
      (assets ?? []).map((asset) => ({
        assetId: asset.id,
        instrumentId: asset.chart.instrument_id ?? asset.instrument_id,
        data: asset.chart.data,
      })),
    [assets],
  );
  const liveCharts = useLiveChartSeries({
    enabled: refreshInterval === "live",
    timeframe,
    seeds,
  });
  const liveAssets = useMemo(
    () =>
      (assets ?? []).map((asset) => {
        const nextChartData = liveCharts.seriesByAssetId.get(asset.id);

        if (!nextChartData) {
          return asset;
        }

        const lastCandle = nextChartData[nextChartData.length - 1];

        return {
          ...asset,
          price: lastCandle?.close ?? asset.price,
          chart: {
            ...asset.chart,
            data: nextChartData,
          },
        };
      }),
    [assets, liveCharts.seriesByAssetId],
  );

  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    setSorting((old) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(old)
          : updaterOrValue;
      return newSorting;
    });
  };

  const handleProfileChange = (nextProfile: ScreenerProfile) => {
    setProfile(nextProfile);
    setSorting((currentSorting) =>
      isSortingVisibleForProfile(currentSorting, nextProfile)
        ? currentSorting
        : getDefaultSortingForProfile(nextProfile),
    );
  };

  return (
    <div className="px-0 sm:px-4">
      {/* Section label */}
      <div className="mb-4 flex items-center gap-3 px-4 sm:px-0">
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "oklch(0.45 0 0)",
          }}
        >
          Asset Screener
        </p>
        <div
          className="h-px flex-1"
          style={{ background: "oklch(1 0 0 / 6%)" }}
        />
      </div>

      <div
        className="mb-2 rounded-[8px] px-1 sm:px-0"
        style={{
          background: "oklch(1 0 0 / 2%)",
          border: "1px solid oklch(1 0 0 / 6%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <ScreenerConfigs
          timeframe={timeframe}
          profile={profile}
          refreshInterval={refreshInterval}
          density={density}
          assetNameFilter={assetNameFilter}
          isRefreshing={isFetching}
          onTimeframeChange={setTimeframe}
          onProfileChange={handleProfileChange}
          onRefreshIntervalChange={setRefreshInterval}
          onDensityChange={setDensity}
          onAssetNameFilterChange={setAssetNameFilter}
          onManualRefresh={() => {
            void refetch();
          }}
        />
      </div>

      <div
        className="rounded-none sm:rounded-[8px]"
        style={{
          background: "#0a0a0a",
          border: "1px solid oklch(1 0 0 / 7%)",
          overflow: "hidden",
        }}
      >
        <DataTable<ScreenerAssetWithChart, unknown>
          columns={columns}
          data={liveAssets}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          density={density}
          hideHeader={density === "extended"}
        />
      </div>
    </div>
  );
};
