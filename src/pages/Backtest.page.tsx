import { StandardChart } from "@/features/chart/StandardChart";
import { AssetSearch } from "@/features/backtest/AssetSearch";
import { useBacktestStore } from "@/features/backtest/store/backtest.store";
import { useEffect, useMemo } from "react";
import { detectAll4hHighBreaks } from "@/features/backtest/utils/patterns";
import type { OHLCV } from "@/patterns/types/chart.types";

/**
 * Aggregate 1m candles into higher timeframes
 * @param klines - Array of 1m OHLCV data
 * @param minutes - Timeframe in minutes (5, 15, 60, etc.)
 */
function aggregateCandles(klines: OHLCV[], minutes: number): OHLCV[] {
  if (!klines || klines.length === 0) return [];

  const aggregated: OHLCV[] = [];
  const msPerCandle = minutes * 60 * 1000;

  // Group candles by timeframe
  let currentGroup: OHLCV[] = [];
  let currentPeriodStart: number | null = null;

  for (const candle of klines) {
    const candleTime = Number(candle.time);
    const periodStart = Math.floor(candleTime / msPerCandle) * msPerCandle;

    if (currentPeriodStart === null) {
      currentPeriodStart = periodStart;
    }

    if (periodStart === currentPeriodStart) {
      // Same period, add to group
      currentGroup.push(candle);
    } else {
      // New period, aggregate previous group
      if (currentGroup.length > 0) {
        aggregated.push(aggregateGroup(currentGroup, currentPeriodStart));
      }
      // Start new group
      currentGroup = [candle];
      currentPeriodStart = periodStart;
    }
  }

  // Aggregate last group
  if (currentGroup.length > 0 && currentPeriodStart !== null) {
    aggregated.push(aggregateGroup(currentGroup, currentPeriodStart));
  }

  return aggregated;
}

/**
 * Aggregate a group of candles into a single candle
 */
function aggregateGroup(candles: OHLCV[], periodStart: number): OHLCV {
  const open = Number(candles[0].open);
  const close = Number(candles[candles.length - 1].close);
  const high = Math.max(...candles.map((c) => Number(c.high)));
  const low = Math.min(...candles.map((c) => Number(c.low)));
  const volume = candles.reduce((sum, c) => sum + Number(c.volume), 0);
  const quoteVolume = candles.reduce(
    (sum, c) => sum + Number(c.quote_volume || 0),
    0
  );

  return {
    time: periodStart,
    open: open.toString(),
    high: high.toString(),
    low: low.toString(),
    close: close.toString(),
    volume: volume.toString(),
    quote_volume: quoteVolume.toString(),
  };
}

export default function BacktestPage() {
  const { klines, loadAssets, isLoadingKlines, selectedAsset } =
    useBacktestStore();

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Generate higher timeframes
  const klines5m = useMemo(() => aggregateCandles(klines ?? [], 5), [klines]);
  const klines15m = useMemo(() => aggregateCandles(klines ?? [], 15), [klines]);

  // const fourHourHighBreaks = detectAll4hHighBreaks(klines ?? [], 240, 60);
  // const fourHourHighBreaks5m = detectAll4hHighBreaks(klines5m ?? [], 48, 12);
  // const fourHourHighBreaks15m = detectAll4hHighBreaks(klines15m ?? [], 16, 4);

  // const chartEvents = [...fourHourHighBreaks].map((fourHourHighBreak) => ({
  //   type: "4hHighBreak",
  //   time: fourHourHighBreak.time,
  //   index: fourHourHighBreak.breakIndex,
  // }));

  // const chartEvents5m = [...fourHourHighBreaks5m].map((fourHourHighBreak) => ({
  //   type: "4hHighBreak",
  //   time: fourHourHighBreak.time,
  //   index: fourHourHighBreak.breakIndex,
  // }));

  // const chartEvents15m = [...fourHourHighBreaks15m].map(
  //   (fourHourHighBreak) => ({
  //     type: "4hHighBreak",
  //     time: fourHourHighBreak.time,
  //     index: fourHourHighBreak.breakIndex,
  //   })
  // );

  return (
    <div className="container mx-auto px-4">
      <div className="flex gap-5">
        <div className="h-full">
          <h2 className="text-2xl font-bold mb-2">Asset Search</h2>
          <AssetSearch />
        </div>
        <div className="w-full space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-2">Chart 15m</h2>
            {isLoadingKlines ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <StandardChart
                assetName={`${selectedAsset} - 15m`}
                klines={klines15m}
                events={[]}
                height="600px"
                width="100%"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
