import { useEffect, useMemo, useState } from "react";
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
    columnOrder,
    density,
    minVolume,
    sorting,
    timeframe,
    watchlistFilter,
    setDensity,
    setColumnOrder,
    setMinVolume,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  } = useScannerTableConfigStore();
  const scannerSortParams = getScannerSortParams(sorting);
  const refetchIntervalMs = refreshInterval === "live" ? 5000 : false;
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

  useEffect(() => {
    if (selectedSymbol || !filteredAssets[0]) {
      return;
    }

    setSelectedSymbol(filteredAssets[0].symbol);
  }, [filteredAssets, selectedSymbol]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.symbol === selectedSymbol) ??
    filteredAssets[0];

  return {
    columnOrder,
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
    setColumnOrder,
    setMinVolume,
    setSelectedSymbol,
    setSorting,
    setTimeframe,
    setWatchlistFilter,
  };
}
