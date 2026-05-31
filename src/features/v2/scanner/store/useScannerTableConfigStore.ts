import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MIN_VOLUME_OPTIONS, WATCHLIST_OPTIONS } from "../lib/scannerOptions";
import type { DensityMode, ScannerPreset, ScannerTimeframe } from "../types";

type WatchlistFilter = (typeof WATCHLIST_OPTIONS)[number];
type MinVolumeFilter = (typeof MIN_VOLUME_OPTIONS)[number];

type ScannerTableConfigState = {
  density: DensityMode;
  minVolume: MinVolumeFilter;
  preset: ScannerPreset;
  sorting: SortingState;
  timeframe: ScannerTimeframe;
  watchlistFilter: WatchlistFilter;
  setDensity: (density: DensityMode) => void;
  setMinVolume: (minVolume: MinVolumeFilter) => void;
  setPreset: (preset: ScannerPreset) => void;
  setSorting: OnChangeFn<SortingState>;
  setTimeframe: (timeframe: ScannerTimeframe) => void;
  setWatchlistFilter: (watchlistFilter: WatchlistFilter) => void;
};

const DEFAULT_SORTING: SortingState = [{ id: "change24h", desc: true }];

export const useScannerTableConfigStore = create<ScannerTableConfigState>()(
  persist(
    (set) => ({
      density: "compact",
      minVolume: MIN_VOLUME_OPTIONS[1],
      preset: "Gainers",
      sorting: DEFAULT_SORTING,
      timeframe: "1h",
      watchlistFilter: WATCHLIST_OPTIONS[0],
      setDensity: (density) => set({ density }),
      setMinVolume: (minVolume) => set({ minVolume }),
      setPreset: (preset) => set({ preset }),
      setSorting: (updaterOrValue) =>
        set((state) => ({
          sorting:
            typeof updaterOrValue === "function"
              ? updaterOrValue(state.sorting)
              : updaterOrValue,
        })),
      setTimeframe: (timeframe) => set({ timeframe }),
      setWatchlistFilter: (watchlistFilter) => set({ watchlistFilter }),
    }),
    {
      name: "scanner-v2-table-config",
      partialize: ({
        density,
        minVolume,
        preset,
        sorting,
        timeframe,
        watchlistFilter,
      }) => ({
        density,
        minVolume,
        preset,
        sorting,
        timeframe,
        watchlistFilter,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
