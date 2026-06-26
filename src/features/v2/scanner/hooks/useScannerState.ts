import type { SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { MomentumScannerRequest } from "../hooks/scanner.api";
import { useGetMomentumScanner, useGetScanner } from "../hooks/scanner.api";
import {
  getScannerPresetKey,
  getScannerSortParams,
  mapMomentumEntryToAsset,
  mapScannerRowToAsset,
} from "../lib/apiAdapters";
import { useScannerTableConfigStore } from "../store/useScannerTableConfigStore";
import type { RefreshInterval } from "../types";

type UseScannerStateOptions = {
  refreshInterval: RefreshInterval;
};

function getMomentumSortParams(
  sorting: SortingState,
): Pick<MomentumScannerRequest, "sort_by" | "sort_direction"> {
  const firstSort = sorting[0];

  if (!firstSort) {
    return { sort_by: "score", sort_direction: "desc" };
  }

  const sortByByColumnId: Record<string, string> = {
    price: "price",
    setupScore: "score",
    change5m: "change_5m",
    change15m: "change_15m",
    change1h: "change_1h",
    alignedTimeframes: "aligned_timeframes",
    rvol: "rvol_24h",
    momentumChoppiness: "choppiness_1m",
  };

  return {
    sort_by: sortByByColumnId[firstSort.id] ?? "score",
    sort_direction: firstSort.desc ? "desc" : "asc",
  };
}

export function useScannerState({ refreshInterval }: UseScannerStateOptions) {
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const {
    density,
    minVolume,
    preset,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setPreset,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  } = useScannerTableConfigStore();
  const scannerSortParams = getScannerSortParams(sorting);
  const isMomentumPreset =
    preset === "Momentum Long" || preset === "Momentum Short";
  const momentumSide = preset === "Momentum Short" ? "short" : "long";
  const refetchIntervalMs = refreshInterval === "live" ? 3000 : false;
  const scannerQuery = useGetScanner(
    {
      preset: getScannerPresetKey(preset),
      search,
      limit: 10,
      ...scannerSortParams,
    },
    {
      enabled: !isMomentumPreset,
      refetchIntervalMs,
    },
  );
  const momentumSortParams = getMomentumSortParams(sorting);
  const momentumQuery = useGetMomentumScanner(
    {
      preset: momentumSide,
      search,
      limit: 10,
      ...momentumSortParams,
    },
    {
      enabled: isMomentumPreset,
      refetchIntervalMs,
    },
  );

  const filteredAssets = useMemo(() => {
    if (isMomentumPreset) {
      return (momentumQuery.data?.entries ?? []).map((row) =>
        mapMomentumEntryToAsset(row),
      );
    }

    if (!scannerQuery.data) {
      return [];
    }

    return scannerQuery.data.entries.map((row) => mapScannerRowToAsset(row));
  }, [isMomentumPreset, momentumQuery.data, scannerQuery.data]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.symbol === selectedSymbol) ??
    filteredAssets[0];

  return {
    density,
    filteredAssets,
    minVolume,
    preset,
    search,
    selectedAsset,
    selectedSymbol,
    scannerQuery,
    momentumQuery,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setPreset,
    setSearch,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  };
}
