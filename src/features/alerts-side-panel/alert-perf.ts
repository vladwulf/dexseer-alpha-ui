import type { Alert } from "@/types/ohlcv";

const THRESHOLDS = [0.5, 1.0, 2.0, 3.0, 5.0];

interface AlertResult {
  alertId: number;
  symbol: string;
  alertType: string;
  alertTime: string;
  entryPrice: number;
  expectedDirection: "up" | "down";
  /** Max % move in expected direction (always positive) */
  maxFavorableMove: number;
  /** Max % move against expected direction (always positive) */
  maxAdverseMove: number;
  /** Did the favorable move exceed the adverse move? */
  correctDirection: boolean;
}

interface Summary {
  totalAlerts: number;
  avgMaxFavorableMove: number;
  avgMaxAdverseMove: number;
  /** % of alerts where favorable > adverse */
  directionalAccuracy: number;
  /** For each threshold: % of alerts that reached it in the expected direction */
  thresholdAccuracy: Record<string, number>;
}

/**
 * Analyze a single alert: find max favorable/adverse moves
 * from the open of the candle AFTER the alert candle to end of data.
 */
function analyzeAlert(alert: Alert): AlertResult {
  const { ohlc } = alert;
  const alertIdx = ohlc.findIndex((c) => c.time === alert.time);
  if (alertIdx === -1) throw new Error(`Alert candle not found: ${alert.id}`);

  const entryIdx = alertIdx + 1;
  if (entryIdx >= ohlc.length)
    throw new Error(`No candle after alert: ${alert.id}`);

  const entryPrice = ohlc[entryIdx].open;
  const isLong = alert.type.includes("LONG");
  const expectedDirection: "up" | "down" = isLong ? "up" : "down";

  let maxFavorable = 0;
  let maxAdverse = 0;

  for (let i = entryIdx; i < ohlc.length; i++) {
    const c = ohlc[i];
    const upPct = ((c.high - entryPrice) / entryPrice) * 100;
    const downPct = ((entryPrice - c.low) / entryPrice) * 100;

    if (isLong) {
      maxFavorable = Math.max(maxFavorable, upPct);
      maxAdverse = Math.max(maxAdverse, downPct);
    } else {
      maxFavorable = Math.max(maxFavorable, downPct);
      maxAdverse = Math.max(maxAdverse, upPct);
    }
  }

  return {
    alertId: alert.id,
    symbol: alert.asset.symbol,
    alertType: alert.type,
    alertTime: alert.time,
    entryPrice,
    expectedDirection,
    maxFavorableMove: maxFavorable,
    maxAdverseMove: maxAdverse,
    correctDirection: maxFavorable > maxAdverse,
  };
}

/**
 * Analyze an array of alerts and return per-alert results + summary.
 */
export function analyzeAlerts(alerts: Alert[]): {
  results: AlertResult[];
  summary: Summary;
} {
  const results = alerts.map(analyzeAlert);
  const n = results.length;

  if (n === 0) {
    return {
      results: [],
      summary: {
        totalAlerts: 0,
        avgMaxFavorableMove: 0,
        avgMaxAdverseMove: 0,
        directionalAccuracy: 0,
        thresholdAccuracy: {},
      },
    };
  }

  const avgFav = results.reduce((s, r) => s + r.maxFavorableMove, 0) / n;
  const avgAdv = results.reduce((s, r) => s + r.maxAdverseMove, 0) / n;
  const correctCount = results.filter((r) => r.correctDirection).length;

  const thresholdAccuracy: Record<string, number> = {};
  for (const t of THRESHOLDS) {
    const hitCount = results.filter((r) => r.maxFavorableMove >= t).length;
    thresholdAccuracy[`${t}%`] = (hitCount / n) * 100;
  }

  return {
    results,
    summary: {
      totalAlerts: n,
      avgMaxFavorableMove: avgFav,
      avgMaxAdverseMove: avgAdv,
      directionalAccuracy: (correctCount / n) * 100,
      thresholdAccuracy,
    },
  };
}

/**
 * Analyze alerts split by LONG/SHORT type.
 */
export function analyzeAlertsByType(alerts: Alert[]) {
  const longAlerts = alerts.filter((a) => a.type.includes("LONG"));
  const shortAlerts = alerts.filter((a) => a.type.includes("SHORT"));

  return {
    long: analyzeAlerts(longAlerts),
    short: analyzeAlerts(shortAlerts),
    all: analyzeAlerts(alerts),
  };
}

// Usage:
// const { long, short, all } = analyzeAlertsByType(alerts);
// console.log(long.summary.directionalAccuracy);    // e.g. 65.2
// console.log(long.summary.avgMaxFavorableMove);     // e.g. 3.41
// console.log(long.summary.thresholdAccuracy["1%"]); // e.g. 78.5
