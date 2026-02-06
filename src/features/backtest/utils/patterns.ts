import type { ParsedKLine } from "@/patterns/types/binance.types";
import type { OHLCV } from "@/patterns/types/chart.types";

/**
 * Signal for 4h high break with relevant information
 */
export interface FourHourHighBreakSignal {
  time: number;
  breakIndex: number; // Index where break occurred
  breakHigh: number; // The high that broke the 4h resistance
  fourHourHigh: number; // The 4h high that was broken
  fourHourHighIndex: number; // Index of the candle that formed the 4h high
}

/**
 * Detect if current candle breaks the 4h high
 *
 * @param klines - Array of parsed k-lines
 * @param lookbackPeriod - Number of candles representing 4 hours (e.g., 4 for 1h candles, 48 for 5m candles)
 * @returns true if current candle breaks the highest high of the 4h lookback period
 */
export function detect4hHighBreak(
  klines: OHLCV[],
  lookbackPeriod = 4
): boolean {
  if (klines.length < lookbackPeriod + 1) return false;

  const currentIndex = klines.length - 1;
  const currentCandle = klines[currentIndex];

  // Find the highest high in the 4h lookback period (excluding current candle)
  let fourHourHigh = -Infinity;
  for (let i = currentIndex - lookbackPeriod; i < currentIndex; i++) {
    if (Number(klines[i].high) > fourHourHigh) {
      fourHourHigh = Number(klines[i].high);
    }
  }

  // Break: Current high exceeds the 4h high
  return Number(currentCandle.high) > fourHourHigh;
}

/**
 * Detect all 4h high breaks in the entire dataset with cooldown
 *
 * @param klines - Full array of parsed k-lines
 * @param lookbackPeriod - Number of candles representing 4 hours
 * @param cooldownPeriod - Minimum candles between break signals to avoid duplicates
 * @returns Array of 4h high break signals
 */
export function detectAll4hHighBreaks(
  klines: OHLCV[],
  lookbackPeriod = 240,
  cooldownPeriod = 60
): FourHourHighBreakSignal[] {
  const breakSignals: FourHourHighBreakSignal[] = [];
  let lastBreakIndex = -1;

  for (let i = lookbackPeriod; i < klines.length; i++) {
    // Skip if within cooldown period
    if (lastBreakIndex >= 0 && i - lastBreakIndex < cooldownPeriod) {
      continue;
    }

    const currentCandle = klines[i];

    // Find the highest high in the 4h lookback period
    let fourHourHigh = -Infinity;
    let fourHourHighIndex = i - lookbackPeriod;

    for (let j = i - lookbackPeriod; j < i; j++) {
      if (Number(klines[j].high) > fourHourHigh) {
        fourHourHigh = Number(klines[j].high);
        fourHourHighIndex = j;
      }
    }

    // Check if current candle breaks the 4h high
    if (Number(currentCandle.high) > fourHourHigh) {
      breakSignals.push({
        time: currentCandle.time,
        breakIndex: i,
        breakHigh: Number(currentCandle.high),
        fourHourHigh: fourHourHigh,
        fourHourHighIndex: fourHourHighIndex,
      });
      lastBreakIndex = i;
    }
  }

  return breakSignals;
}

/**
 * Get the current 4h high level (without checking for break)
 * Useful for monitoring or displaying resistance levels
 *
 * @param klines - Array of parsed k-lines
 * @param lookbackPeriod - Number of candles representing 4 hours
 * @returns The highest high in the lookback period, or null if insufficient data
 */
export function get4hHigh(
  klines: ParsedKLine[],
  lookbackPeriod = 4
): { high: number; index: number } | null {
  if (klines.length < lookbackPeriod) return null;

  const currentIndex = klines.length - 1;
  let fourHourHigh = -Infinity;
  let fourHourHighIndex = currentIndex - lookbackPeriod;

  // Find the highest high in the 4h lookback period
  for (let i = currentIndex - lookbackPeriod + 1; i <= currentIndex; i++) {
    if (klines[i].high > fourHourHigh) {
      fourHourHigh = klines[i].high;
      fourHourHighIndex = i;
    }
  }

  return {
    high: fourHourHigh,
    index: fourHourHighIndex,
  };
}
