import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OHLCV } from "@/patterns/types/chart.types";
import { getKlinesAPI } from "@/data/klines-api-client";

interface BacktestState {
  // State
  selectedAsset: string;
  klines: OHLCV[];
  availableAssets: string[];
  isLoadingAssets: boolean;
  isLoadingKlines: boolean;
  error: string | null;

  // Actions
  setSelectedAsset: (asset: string) => void;
  loadAssets: (limit?: number) => Promise<void>;
  loadKlines: (asset: string, limit?: number) => Promise<void>;
  clearKlines: () => void;
  clearError: () => void;
}

export const useBacktestStore = create<BacktestState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedAsset: "",
      klines: [],
      availableAssets: [],
      isLoadingAssets: false,
      isLoadingKlines: false,
      error: null,

      // Set selected asset
      setSelectedAsset: (asset: string) => {
        set({ selectedAsset: asset.toUpperCase() });
        // Automatically load klines when asset is selected
        if (asset) {
          get().loadKlines(asset.toUpperCase(), 50000000);
        } else {
          get().clearKlines();
        }
      },

      // Load available assets
      loadAssets: async () => {
        set({ isLoadingAssets: true, error: null });
        try {
          const api = getKlinesAPI();
          const assets = await api.getAssets();
          set({ availableAssets: assets, isLoadingAssets: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load assets",
            isLoadingAssets: false,
          });
        }
      },

      // Load klines for an asset
      loadKlines: async (asset: string, limit: number = 2000) => {
        set({ isLoadingKlines: true, error: null });
        try {
          const api = getKlinesAPI();
          const klinesData = await api.getKlines(asset.toUpperCase(), limit);

          // Convert ParsedKLine to OHLCV format
          const klines: OHLCV[] = klinesData.map((k) => ({
            time: k.openTime,
            open: k.open.toString(),
            high: k.high.toString(),
            low: k.low.toString(),
            close: k.close.toString(),
            volume: k.volume.toString(),
            quote_volume: k.quoteVolume.toString(),
          }));

          set({
            klines,
            selectedAsset: asset.toUpperCase(),
            isLoadingKlines: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load klines",
            isLoadingKlines: false,
          });
        }
      },

      // Clear klines
      clearKlines: () => {
        set({ klines: [], selectedAsset: "" });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "backtest-storage",
      partialize: (state) => ({
        selectedAsset: state.selectedAsset,
        klines: state.klines,
        availableAssets: state.availableAssets,
        // Don't persist loading states and errors
      }),
    }
  )
);
