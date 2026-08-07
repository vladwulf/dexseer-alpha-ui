import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_SCANNER_COLUMN_ORDER,
  normalizeScannerColumnOrder,
} from "../lib/scannerColumns";
import { MIN_VOLUME_OPTIONS, WATCHLIST_OPTIONS } from "../lib/scannerOptions";
import type { DensityMode, ScannerPreset, ScannerTimeframe } from "../types";

type WatchlistFilter = (typeof WATCHLIST_OPTIONS)[number];
type MinVolumeFilter = (typeof MIN_VOLUME_OPTIONS)[number];

type ScannerTableConfigState = {
  columnOrder: string[];
  density: DensityMode;
  minVolume: MinVolumeFilter;
  preset: ScannerPreset;
  sorting: SortingState;
  sortingsByPreset: Partial<Record<ScannerPreset, SortingState>>;
  timeframe: ScannerTimeframe;
  watchlistFilter: WatchlistFilter;
  setDensity: (density: DensityMode) => void;
  setColumnOrder: (columnOrder: string[]) => void;
  setMinVolume: (minVolume: MinVolumeFilter) => void;
  setPreset: (preset: ScannerPreset) => void;
  setSorting: OnChangeFn<SortingState>;
  setTimeframe: (timeframe: ScannerTimeframe) => void;
  setWatchlistFilter: (watchlistFilter: WatchlistFilter) => void;
};

const DEFAULT_SORTING: SortingState = [{ id: "momentumScore", desc: true }];
const MOMENTUM_SORTING: SortingState = [{ id: "setupScore", desc: true }];

function includeMomentumScoreColumn(columnOrder: string[]) {
  if (columnOrder.includes("momentumScore")) return columnOrder;

  const priceIndex = columnOrder.indexOf("price");
  const insertAt = priceIndex === -1 ? 1 : priceIndex + 1;
  return [
    ...columnOrder.slice(0, insertAt),
    "momentumScore",
    ...columnOrder.slice(insertAt),
  ];
}

function isMomentumPreset(preset: ScannerPreset) {
  return preset === "Momentum Long" || preset === "Momentum Short";
}

function getDefaultSortingForPreset(preset: ScannerPreset) {
  return isMomentumPreset(preset) ? MOMENTUM_SORTING : DEFAULT_SORTING;
}

function normalizePreset(preset: unknown): ScannerPreset {
  return preset === "Momentum" ? "Momentum Long" : (preset as ScannerPreset);
}

export const useScannerTableConfigStore = create<ScannerTableConfigState>()(
  persist(
    (set) => ({
      columnOrder: DEFAULT_SCANNER_COLUMN_ORDER,
      density: "compact",
      minVolume: MIN_VOLUME_OPTIONS[1],
      preset: "Classic Rolling",
      sorting: DEFAULT_SORTING,
      sortingsByPreset: {
        "Classic Rolling": DEFAULT_SORTING,
        "Momentum Long": MOMENTUM_SORTING,
        "Momentum Short": MOMENTUM_SORTING,
      },
      timeframe: "1h",
      watchlistFilter: WATCHLIST_OPTIONS[0],
      setDensity: (density) => set({ density }),
      setColumnOrder: (columnOrder) =>
        set({ columnOrder: normalizeScannerColumnOrder(columnOrder) }),
      setMinVolume: (minVolume) => set({ minVolume }),
      setPreset: (preset) =>
        set((state) => ({
          preset,
          sorting:
            state.sortingsByPreset[preset] ??
            getDefaultSortingForPreset(preset),
          sortingsByPreset: {
            ...state.sortingsByPreset,
            [state.preset]: state.sorting,
          },
        })),
      setSorting: (updaterOrValue) =>
        set((state) => {
          const nextSorting =
            typeof updaterOrValue === "function"
              ? updaterOrValue(state.sorting)
              : updaterOrValue;

          return {
            sorting: nextSorting,
            sortingsByPreset: {
              ...state.sortingsByPreset,
              [state.preset]: nextSorting,
            },
          };
        }),
      setTimeframe: (timeframe) => set({ timeframe }),
      setWatchlistFilter: (watchlistFilter) => set({ watchlistFilter }),
    }),
    {
      name: "scanner-v2-table-config",
      partialize: ({
        density,
        columnOrder,
        minVolume,
        preset,
        sorting,
        sortingsByPreset,
        timeframe,
        watchlistFilter,
      }) => ({
        density,
        columnOrder,
        minVolume,
        preset,
        sorting,
        sortingsByPreset,
        timeframe,
        watchlistFilter,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState) => {
        if (typeof persistedState !== "object" || persistedState === null) {
          return persistedState;
        }

        const persisted = persistedState as {
          preset?: unknown;
          columnOrder?: unknown;
          sorting?: SortingState;
          sortingsByPreset?: Partial<
            Record<ScannerPreset | "Momentum", SortingState>
          >;
        };
        const preset = normalizePreset(persisted.preset);
        const sortingsByPreset = {
          ...persisted.sortingsByPreset,
          "Momentum Long":
            persisted.sortingsByPreset?.Momentum ??
            persisted.sortingsByPreset?.["Momentum Long"] ??
            MOMENTUM_SORTING,
        };
        delete sortingsByPreset.Momentum;

        return {
          ...persistedState,
          preset,
          sorting:
            persisted.sorting ??
            sortingsByPreset[preset] ??
            getDefaultSortingForPreset(preset),
          sortingsByPreset,
          columnOrder: includeMomentumScoreColumn(
            normalizeScannerColumnOrder(
              persisted.columnOrder ?? DEFAULT_SCANNER_COLUMN_ORDER,
            ),
          ),
        };
      },
    },
  ),
);
