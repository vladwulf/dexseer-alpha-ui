import type { SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useGetScanner } from "../hooks/scanner.api";
import { getScannerPresetKey, mapScannerRowToAsset } from "../lib/apiAdapters";
import { MIN_VOLUME_OPTIONS, WATCHLIST_OPTIONS } from "../lib/scannerOptions";
import type { DensityMode, ScannerPreset, ScannerTimeframe } from "../types";

export function useScannerState() {
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState<ScannerTimeframe>("1h");
  const [preset, setPreset] = useState<ScannerPreset>("Gainers");
  const [watchlistFilter, setWatchlistFilter] = useState<
    (typeof WATCHLIST_OPTIONS)[number]
  >(WATCHLIST_OPTIONS[0]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "change24h", desc: true },
  ]);
  const [density, setDensity] = useState<DensityMode>("compact");
  const [minVolume, setMinVolume] = useState<
    (typeof MIN_VOLUME_OPTIONS)[number]
  >(MIN_VOLUME_OPTIONS[1]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const scannerQuery = useGetScanner({
    preset: getScannerPresetKey(preset),
    search,
    timeframe,
    limit: 100,
  });

  const filteredAssets = useMemo(() => {
    const assets = scannerQuery.data?.entries.map(mapScannerRowToAsset) ?? [];

    if (sorting.length === 0) return assets;

    const { id, desc } = sorting[0];
    const sorted = [...assets];
    sorted.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[id];
      const bVal = (b as Record<string, unknown>)[id];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return desc ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });
    return sorted;
  }, [scannerQuery.data, sorting]);

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
