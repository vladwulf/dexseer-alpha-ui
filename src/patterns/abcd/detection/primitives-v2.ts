import type { ParsedKLine } from "@/patterns/types/binance.types";

/**
 * Detect all BOS (Break of Structure) signals with minimum spacing
 * @param klines Array of parsed k-lines
 * @param loopbackPeriod Lookback window for comparison
 * @param minSpacing Minimum candles between BOS signals
 * @returns Array of indices where BOS occurred
 */
export function detectAllBosSignals(
  klines: ParsedKLine[],
  loopbackPeriod = 30,
  minSpacing = 30
): number[] {
  const bosIndices: number[] = [];
  let lastBosIndex = -1;

  for (let i = 1; i < klines.length - loopbackPeriod; i++) {
    // Skip if within spacing period
    if (lastBosIndex >= 0 && i - lastBosIndex < minSpacing) {
      continue;
    }

    const candle = klines[i];
    const previousCandle = klines[i - 1];
    
    // BOS: Current high breaks previous high
    if (candle.high > previousCandle.high) {
      bosIndices.push(i);
      lastBosIndex = i;
    }
  }

  return bosIndices;
}

/**
 * Returns boolean if BOS occurred at current position
 */
export function detectBosStart(
  klines: ParsedKLine[],
  loopbackPeriod = 30
): boolean {
  if (klines.length < 2) return false;
  
  const lastIndex = klines.length - 1;
  const candle = klines[lastIndex];
  const previousCandle = klines[lastIndex - 1];
  
  return candle.high > previousCandle.high;
}

