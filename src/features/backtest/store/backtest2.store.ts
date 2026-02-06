import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BacktestState {
  selectedAssetId: number | null;

  setSelectedAssetId: (id: number) => void;
}

export const useBacktestStore2 = create<BacktestState>()(
  persist(
    (set, get) => ({
      selectedAssetId: null,
      setSelectedAssetId: (id: number) => {
        set({ selectedAssetId: id });
      },
    }),
    {
      name: "backtest-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
