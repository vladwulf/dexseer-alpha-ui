import type { KLine } from "@/patterns/types/binance.types";
import type { Time } from "lightweight-charts";

export interface ABCDPattern {
  A: {
    price: number;
    index: number;
    time: Time;
  };
  B: {
    price: number;
    index: number;
    time: Time;
  };
  C: {
    price: number;
    index: number;
    time: Time;
  };
  breakoutLevel: number; // Level above A where alert triggers
  type: "bullish";
  strength: number; // 0-100 confidence score
}

interface ProcessedCandle {
  index: number;
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Detect ABCD patterns in k-line data
 *
 * Pattern structure:
 * - A: Initial spike/high (peak)
 * - B: Pullback low (below A)
 * - C: Higher low (above B, shows strength)
 * - Breakout: Price breaks above A (trigger point)
 */
export function detectABCDPatterns(
  klines: KLine[],
  options: {
    minBarsForPattern?: number;
    maxBarsForPattern?: number;
    minRetracementPercent?: number;
    maxRetracementPercent?: number;
  } = {}
): ABCDPattern[] {
  const {
    minBarsForPattern = 10,
    maxBarsForPattern = 500,
    minRetracementPercent = 0.01,
    maxRetracementPercent = 0.99,
  } = options;

  // Convert k-lines to processed format
  const candles: ProcessedCandle[] = klines.map((kline, index) => ({
    index,
    time: Math.floor(kline[0] / 1000) as Time,
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
  }));

  const patterns: ABCDPattern[] = [];

  // Simple approach: scan through candles looking for A-B-C structure
  const lookbackStart = Math.max(0, candles.length - maxBarsForPattern);

  console.log(`Scanning ${candles.length} candles from index ${lookbackStart}`);

  // Find all significant highs as potential A points
  for (
    let aIdx = lookbackStart;
    aIdx < candles.length - minBarsForPattern;
    aIdx++
  ) {
    const aCandle = candles[aIdx];

    // Check if this is a significant high (higher than neighbors)
    const leftOk = aIdx === 0 || candles[aIdx - 1].high < aCandle.high;
    const rightOk =
      aIdx === candles.length - 1 || candles[aIdx + 1].high < aCandle.high;

    if (!leftOk || !rightOk) continue;

    // Find lowest point after A (within reasonable range)
    let bCandle: ProcessedCandle | null = null;
    let bIdx = aIdx;

    for (let i = aIdx + 1; i < Math.min(aIdx + 100, candles.length); i++) {
      if (!bCandle || candles[i].low < bCandle.low) {
        bCandle = candles[i];
        bIdx = i;
      }
    }

    if (!bCandle) continue;

    // Check retracement
    const retracementPercent = (aCandle.high - bCandle.low) / aCandle.high;
    if (
      retracementPercent < minRetracementPercent ||
      retracementPercent > maxRetracementPercent
    ) {
      continue;
    }

    // Find C point - a higher low after B
    let cCandle: ProcessedCandle | null = null;
    let cIdx = bIdx;

    for (let i = bIdx + 3; i < Math.min(bIdx + 150, candles.length); i++) {
      const current = candles[i];

      // C should be:
      // 1. Higher low than B
      // 2. Still below A (hasn't broken out)
      if (current.low > bCandle.low && current.high < aCandle.high) {
        // Use the most recent valid C point
        cCandle = current;
        cIdx = i;
      }
    }

    if (!cCandle) continue;

    // Calculate strength
    const strength = calculatePatternStrength(
      candles,
      aCandle,
      bCandle,
      cCandle
    );

    console.log(
      `Found pattern: A=${aCandle.high.toFixed(
        6
      )} (${aIdx}), B=${bCandle.low.toFixed(
        6
      )} (${bIdx}), C=${cCandle.low.toFixed(6)} (${cIdx}), strength=${strength}`
    );

    patterns.push({
      A: {
        price: aCandle.high,
        index: aIdx,
        time: aCandle.time,
      },
      B: {
        price: bCandle.low,
        index: bIdx,
        time: bCandle.time,
      },
      C: {
        price: cCandle.low,
        index: cIdx,
        time: cCandle.time,
      },
      breakoutLevel: aCandle.high,
      type: "bullish",
      strength,
    });
  }

  console.log(`Total patterns found: ${patterns.length}`);

  // Return the most recent patterns
  return patterns.sort((a, b) => b.C.index - a.C.index).slice(0, 5);
}

/**
 * Calculate pattern strength (0-100)
 */
function calculatePatternStrength(
  _candles: ProcessedCandle[],
  aPoint: ProcessedCandle,
  bPoint: ProcessedCandle,
  cPoint: ProcessedCandle
): number {
  let strength = 0;

  // 1. Volume progression (if available)
  strength += 20;

  // 2. Clean retracement (closer to 50-61.8% is better)
  const retracementPercent =
    (aPoint.high - bPoint.low) / (aPoint.high - bPoint.low);
  if (retracementPercent >= 0.5 && retracementPercent <= 0.65) {
    strength += 30;
  } else if (retracementPercent >= 0.4 && retracementPercent <= 0.7) {
    strength += 20;
  } else {
    strength += 10;
  }

  // 3. C position (higher C is better - shows strength)
  const cPosition = (cPoint.low - bPoint.low) / (aPoint.high - bPoint.low);
  strength += cPosition * 30;

  // 4. Time structure (good spacing between points)
  const abBars = bPoint.index - aPoint.index;
  const bcBars = cPoint.index - bPoint.index;
  if (abBars >= 5 && bcBars >= 10) {
    strength += 20;
  } else {
    strength += 10;
  }

  return Math.min(100, Math.max(0, strength));
}

/**
 * Check if current price has broken above A (trigger alert)
 */
export function hasBreakout(
  pattern: ABCDPattern,
  currentPrice: number
): boolean {
  return currentPrice > pattern.breakoutLevel;
}
