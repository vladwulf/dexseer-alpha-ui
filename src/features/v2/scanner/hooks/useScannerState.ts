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
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const {
    density,
    minVolume,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  } = useScannerTableConfigStore();
  const scannerSortParams = getScannerSortParams(sorting);
  const refetchIntervalMs = refreshInterval === "live" ? 3000 : false;
  const scannerQuery = useGetScanner(
    {
      preset: getScannerPresetKey("Classic Rolling"),
      limit: 20,
      ...scannerSortParams,
    },
    {
      enabled: true,
      refetchIntervalMs,
    },
  );

  const filteredAssets = useMemo(() => {
    if (!scannerQuery.data) {
      return [];
    }

    return scannerQuery.data.entries.map((row) => mapScannerRowToAsset(row));
  }, [scannerQuery.data]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.symbol === selectedSymbol) ??
    filteredAssets[0];

  return {
    density,
    filteredAssets,
    minVolume,
    selectedAsset,
    selectedSymbol,
    scannerQuery,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  };
}
