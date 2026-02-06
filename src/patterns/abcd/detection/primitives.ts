import type { ParsedKLine } from "@/patterns/types/binance.types";

/**
 * BOS signal with leg information
 */
export interface BosSignal {
  bosIndex: number; // Index where BOS occurred
  legStartIndex: number; // Index where the bullish leg started (lowest low)
  bosHigh: number; // The high that broke structure
  legLow: number; // The low where leg started
}

/**
 * Pullback signal after BOS
 */
export interface PullbackSignal {
  pullbackIndex: number; // Index where pullback completed
  pullbackLow: number; // The low of the pullback
  fromBosIndex: number; // Reference to the BOS it pulled back from
  pullbackPercent: number; // Percentage pullback from BOS high
}

/**
 * Check if a BOS occurs at the last candle in the array
 *
 * @param klines - Array of parsed k-lines
 * @param lookbackPeriod - Number of candles to look back for highest high
 * @returns true if current candle breaks the highest high of lookback period
 */
export function detectBosStart(
  klines: ParsedKLine[],
  lookbackPeriod = 20
): boolean {
  if (klines.length < lookbackPeriod + 1) return false;

  const currentIndex = klines.length - 1;
  const currentCandle = klines[currentIndex];

  // Find the highest high in the lookback period
  let highestHigh = -Infinity;
  for (let i = currentIndex - lookbackPeriod; i < currentIndex; i++) {
    if (klines[i].high > highestHigh) {
      highestHigh = klines[i].high;
    }
  }

  // BOS: Current high breaks the highest high in lookback period
  return currentCandle.high > highestHigh;
}

/**
 * Detect all BOS signals in the entire dataset with cooldown and leg info
 *
 * @param klines - Full array of parsed k-lines
 * @param cooldownPeriod - Minimum candles between BOS signals
 * @param lookbackPeriod - Number of candles to look back for highest high
 * @param impulse - Minimum percentage break required (0 = any break, 0.01 = 1% break)
 * @returns Array of BOS signals with leg information
 */
export function detectAllBosSignals(
  klines: ParsedKLine[],
  cooldownPeriod = 30,
  lookbackPeriod = 20,
  impulse = 0
): BosSignal[] {
  const bosSignals: BosSignal[] = [];
  let lastBosIndex = -1;

  for (let i = lookbackPeriod; i < klines.length; i++) {
    // Skip if within cooldown
    if (lastBosIndex >= 0 && i - lastBosIndex < cooldownPeriod) {
      continue;
    }

    const currentCandle = klines[i];

    // Find the highest high in the lookback period
    let highestHigh = -Infinity;
    for (let j = i - lookbackPeriod; j < i; j++) {
      if (klines[j].high > highestHigh) {
        highestHigh = klines[j].high;
      }
    }

    // Find the lowest low in the lookback period (this is where the leg started)
    let lowestLow = Infinity;
    let lowestLowIndex = i - lookbackPeriod;
    for (let j = i - lookbackPeriod; j < i; j++) {
      if (klines[j].low < lowestLow) {
        lowestLow = klines[j].low;
        lowestLowIndex = j;
      }
    }

    // Calculate the percentage break
    const percentageBreak = (currentCandle.high - lowestLow) / highestHigh;

    // BOS: Current high breaks the highest high by at least the impulse threshold
    if (percentageBreak > impulse) {
      bosSignals.push({
        bosIndex: i,
        legStartIndex: lowestLowIndex,
        bosHigh: currentCandle.high,
        legLow: lowestLow,
      });
      lastBosIndex = i;
    }
  }

  return bosSignals;
}

/**
 * Detect pullback after a BOS
 *
 * @param klines - Full array of parsed k-lines
 * @param bosSignal - BOS signal to detect pullback from
 * @param pullbackThreshold - Minimum percentage pullback (0.3 = 30% retracement)
 * @param maxBarsAfterBos - Maximum bars to look for pullback after BOS
 * @returns Pullback signal if found, null otherwise
 */
export function detectPullbackStart(
  klines: ParsedKLine[],
  bosSignal: BosSignal,
  pullbackThreshold = 0.3,
  maxBarsAfterBos = 50
): PullbackSignal | null {
  const startIndex = bosSignal.bosIndex + 1;
  const endIndex = Math.min(startIndex + maxBarsAfterBos, klines.length);

  let lowestLow = Infinity;
  let lowestLowIndex = -1;

  // Find the lowest low after BOS
  for (let i = startIndex; i < endIndex; i++) {
    if (klines[i].low < lowestLow) {
      lowestLow = klines[i].low;
      lowestLowIndex = i;
    }
  }

  if (lowestLowIndex === -1) return null;

  // Calculate pullback percentage from BOS high
  const pullbackPercent = (bosSignal.bosHigh - lowestLow) / bosSignal.bosHigh;

  // Check if pullback meets threshold
  if (pullbackPercent >= pullbackThreshold) {
    return {
      pullbackIndex: lowestLowIndex,
      pullbackLow: lowestLow,
      fromBosIndex: bosSignal.bosIndex,
      pullbackPercent,
    };
  }

  return null;
}

/**
 * Detect all pullbacks for all BOS signals
 *
 * @param klines - Full array of parsed k-lines
 * @param bosSignals - Array of BOS signals
 * @param pullbackThreshold - Minimum percentage pullback
 * @param maxBarsAfterBos - Maximum bars to look for pullback
 * @returns Array of pullback signals
 */
export function detectAllPullbacks(
  klines: ParsedKLine[],
  bosSignals: BosSignal[],
  pullbackThreshold = 0.3,
  maxBarsAfterBos = 50
): PullbackSignal[] {
  const pullbacks: PullbackSignal[] = [];

  for (const bosSignal of bosSignals) {
    const pullback = detectPullbackStart(
      klines,
      bosSignal,
      pullbackThreshold,
      maxBarsAfterBos
    );
    if (pullback) {
      pullbacks.push(pullback);
    }
  }

  return pullbacks;
}
