import { useMemo, useState } from "react";
import { useGetScanner } from "../hooks/scanner.api";
import {
  getScannerPresetKey,
  getScannerSortParams,
  mapScannerRowToAsset,
} from "../lib/apiAdapters";
import { useScannerTableConfigStore } from "../store/useScannerTableConfigStore";
import type { RefreshInterval } from "../types";

type UseScannerStateOptions = {
  refreshInterval: RefreshInterval;
};

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
  const scannerQuery = useGetScanner(
    {
      preset: getScannerPresetKey(preset),
      search,
      limit: 20,
      ...scannerSortParams,
    },
    {
      refetchIntervalMs: refreshInterval === "live" ? 3000 : false,
    },
  );

  const filteredAssets = useMemo(() => {
    return (scannerQuery.data?.entries ?? []).map((row) =>
      mapScannerRowToAsset(row),
    );
  }, [scannerQuery.data]);

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
