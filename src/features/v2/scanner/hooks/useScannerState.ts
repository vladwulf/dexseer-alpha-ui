import { useMemo, useRef, useState } from "react";
import { useGetScanner } from "../hooks/scanner.api";
import {
  getScannerPresetKey,
  getScannerSortParams,
  mapScannerRowToAsset,
} from "../lib/apiAdapters";
import { useScannerTableConfigStore } from "../store/useScannerTableConfigStore";
import type { ScannerAsset } from "../types";

export function useScannerState() {
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
  const scannerQuery = useGetScanner({
    preset: getScannerPresetKey(preset),
    search,
    limit: 20,
    ...scannerSortParams,
  });

  const assetMapRef = useRef<Map<string, ScannerAsset>>(new Map());

  const filteredAssets = useMemo(() => {
    const entries = scannerQuery.data?.entries ?? [];
    const current = assetMapRef.current;
    const nextMap = new Map<string, ScannerAsset>();
    const result: ScannerAsset[] = [];

    for (const row of entries) {
      const existing = current.get(row.symbol);
      if (existing) {
        result.push(existing);
        nextMap.set(row.symbol, existing);
      } else {
        const asset = mapScannerRowToAsset(row);
        result.push(asset);
        nextMap.set(row.symbol, asset);
      }
    }

    assetMapRef.current = nextMap;
    return result;
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
