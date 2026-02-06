import type { PatternPriceLine } from "../chart/Chart";

/**
 * ABCD Pattern price level calculator
 *
 * ABCD Pattern structure:
 * - Point A: Initial low
 * - Point B: First high (rally)
 * - Point C: Retracement (typically 0.618 or 0.786 of AB)
 * - Point D: Extension (typically 1.272 or 1.618 of BC)
 *
 * Break of Structure (BOS): Price breaks above/below key level confirming trend
 */

export interface ABCDPoints {
  A: number;
  B: number;
  C: number;
  D: number;
}

/**
 * Calculate ABCD pattern price lines for visualization
 */
export function calculateABCDPriceLines(
  points: ABCDPoints,
  type: "bullish" | "bearish" = "bullish"
): PatternPriceLine[] {
  const { A, B, C, D } = points;

  const priceLines: PatternPriceLine[] = [
    {
      price: A,
      color: type === "bullish" ? "#22c55e" : "#ef4444",
      lineWidth: 2,
      lineStyle: 0, // Solid
      title: "Point A",
      axisLabelVisible: true,
    },
    {
      price: B,
      color: type === "bullish" ? "#ef4444" : "#22c55e",
      lineWidth: 2,
      lineStyle: 0, // Solid
      title: "Point B",
      axisLabelVisible: true,
    },
    {
      price: C,
      color: type === "bullish" ? "#22c55e" : "#ef4444",
      lineWidth: 2,
      lineStyle: 0, // Solid
      title: "Point C",
      axisLabelVisible: true,
    },
    {
      price: D,
      color: "#8b5cf6", // violet - target/completion point
      lineWidth: 3,
      lineStyle: 2, // Dashed - projected level
      title: "Point D (Target)",
      axisLabelVisible: true,
    },
  ];

  // Add Break of Structure level (typically between B and C)
  const bosLevel =
    type === "bullish"
      ? Math.min(B, C) + Math.abs(B - C) * 0.5
      : Math.max(B, C) - Math.abs(B - C) * 0.5;

  priceLines.push({
    price: bosLevel,
    color: "#f59e0b", // amber - important breakout level
    lineWidth: 2,
    lineStyle: 1, // Dotted
    title: "BOS",
    axisLabelVisible: true,
  });

  return priceLines;
}

/**
 * Calculate Fibonacci retracement levels for ABCD patterns
 */
export function calculateFibonacciLevels(
  high: number,
  low: number,
  isDowntrend: boolean = false
): PatternPriceLine[] {
  const diff = high - low;
  const fibLevels = [0.236, 0.382, 0.5, 0.618, 0.786];

  return fibLevels.map((level) => {
    const price = isDowntrend ? high - diff * level : low + diff * level;

    return {
      price,
      color: `rgba(139, 92, 246, ${0.3 + level * 0.5})`, // violet with varying opacity
      lineWidth: 1,
      lineStyle: 1, // Dotted
      title: `${(level * 100).toFixed(1)}%`,
      axisLabelVisible: true,
    };
  });
}

/**
 * Example ABCD pattern for demo purposes
 */
export function getExampleABCDPattern(basePrice: number = 0.00892): ABCDPoints {
  return {
    A: basePrice,
    B: basePrice * 1.05, // 5% rally
    C: basePrice * 1.03, // Retracement to ~61.8%
    D: basePrice * 1.08, // Target extension
  };
}
