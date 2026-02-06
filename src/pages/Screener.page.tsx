import { AssetSearch2 } from "@/features/backtest/AssetSearch2";
import { StandardChart } from "@/features/chart/StandardChart";
import { useGetChart } from "@/hooks/chart/useGetChart";
import { useState } from "react";

export function ScreenerPage() {
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  console.log("selectedAssetId", selectedAssetId);

  const { data: chartData } = useGetChart(selectedAssetId, "1m");
  console.log("chartData", chartData);

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="max-w-sm space-y-2">
          <label className="inline-block">Asset Search</label>
          <AssetSearch2 onSelect={setSelectedAssetId} />
        </div>
      </div>

      <div>
        <StandardChart
          assetName={`${chartData?.asset.symbol} - 1m`}
          klines={chartData?.ohlcData ?? []}
          events={[]}
          height="600px"
          width="100%"
        />
      </div>
    </div>
  );
}
