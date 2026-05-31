import { useMemo, useState } from "react";
import {
  MIN_VOLUME_OPTIONS,
  SCANNER_ASSETS,
  WATCHLIST_OPTIONS,
} from "../data/mockScannerData";
import { useGetScanner } from "../hooks/scanner.api";
import { getScannerPresetKey, mapScannerRowToAsset } from "../lib/apiAdapters";
import type {
  DensityMode,
  ScannerPreset,
  ScannerTimeframe,
  SortOption,
} from "../types";

export function useScannerState() {
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState<ScannerTimeframe>("1h");
  const [preset, setPreset] = useState<ScannerPreset>("Gainers");
  const [watchlistFilter, setWatchlistFilter] = useState<
    (typeof WATCHLIST_OPTIONS)[number]
  >(WATCHLIST_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<SortOption>("24h momentum");
  const [density, setDensity] = useState<DensityMode>("compact");
  const [minVolume, setMinVolume] = useState<
    (typeof MIN_VOLUME_OPTIONS)[number]
  >(MIN_VOLUME_OPTIONS[1]);
  const [selectedSymbol, setSelectedSymbol] = useState("DOGEUSDT");
  const scannerQuery = useGetScanner({
    preset: getScannerPresetKey(preset),
    search,
    limit: 100,
  });

  const filteredAssets = useMemo(() => {
    if (scannerQuery.data) {
      return scannerQuery.data.entries.map(mapScannerRowToAsset);
    }

    const normalizedSearch = search.trim().toLowerCase();
    const assets = SCANNER_ASSETS.filter((asset) =>
      normalizedSearch.length === 0
        ? true
        : asset.symbol.toLowerCase().includes(normalizedSearch),
    );

    const sortedAssets = [...assets];

    switch (sortBy) {
      case "Alert count":
        sortedAssets.sort((left, right) => right.alertCount - left.alertCount);
        break;
      case "24h momentum":
        sortedAssets.sort((left, right) => right.change24h - left.change24h);
        break;
      case "RVOL":
        sortedAssets.sort((left, right) => right.rvol - left.rvol);
        break;
      case "Funding":
        sortedAssets.sort((left, right) => right.funding - left.funding);
        break;
      case "BTC correlation":
        sortedAssets.sort(
          (left, right) =>
            Math.abs(left.btcCorrelation) - Math.abs(right.btcCorrelation),
        );
        break;
      default:
        sortedAssets.sort((left, right) => right.setupScore - left.setupScore);
        break;
    }

    return sortedAssets;
  }, [scannerQuery.data, search, sortBy]);

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
    sortBy,
    timeframe,
    watchlistFilter,
    setDensity,
    setMinVolume,
    setPreset,
    setSearch,
    setSelectedSymbol,
    setSortBy,
    setTimeframe,
    setWatchlistFilter,
  };
}
