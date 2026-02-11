import type { Alert } from "@/types/ohlcv";

// --- Configuration ---
const THRESHOLDS = [0.5, 1.0, 2.0, 3.0, 5.0, 7.0, 10.0];
const SYMMETRIC_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // SL% = TP%
const ASYMMETRIC_RATIOS = [
  // 1:2 R:R
  { sl: 1, tp: 2 },
  { sl: 2, tp: 4 },
  { sl: 3, tp: 6 },
  { sl: 4, tp: 8 },
  { sl: 5, tp: 10 },
  { sl: 6, tp: 12 },
  { sl: 7, tp: 14 },
  { sl: 8, tp: 16 },
  { sl: 9, tp: 18 },
  { sl: 10, tp: 20 },

  // 1:3 R:R
  { sl: 1, tp: 3 },
  { sl: 2, tp: 6 },
  { sl: 3, tp: 9 },
  { sl: 4, tp: 12 },
  { sl: 5, tp: 15 },
  { sl: 6, tp: 18 },
  { sl: 7, tp: 21 },
  { sl: 8, tp: 24 },
  { sl: 9, tp: 27 },
  { sl: 10, tp: 30 },

  // 1:4 R:R
  { sl: 1, tp: 4 },
  { sl: 2, tp: 8 },
  { sl: 3, tp: 12 },
  { sl: 4, tp: 16 },
  { sl: 5, tp: 20 },
  { sl: 6, tp: 24 },
  { sl: 7, tp: 28 },
  { sl: 8, tp: 32 },
  { sl: 9, tp: 36 },
  { sl: 10, tp: 40 },

  // 1:5 R:R
  { sl: 1, tp: 5 },
  { sl: 2, tp: 10 },
  { sl: 3, tp: 15 },
  { sl: 4, tp: 20 },
  { sl: 5, tp: 25 },
  { sl: 6, tp: 30 },
  { sl: 7, tp: 35 },
  { sl: 8, tp: 40 },
  { sl: 9, tp: 45 },
  { sl: 10, tp: 50 },
];

// --- Types ---
type Direction = "up" | "down";
type TradeOutcome = "win" | "loss" | "open";

interface AlertResult {
  alertId: number;
  symbol: string;
  alertType: string;
  alertTime: string;
  entryPrice: number;
  expectedDirection: Direction;
  maxFavorableMove: number;
  maxAdverseMove: number;
  correctDirection: boolean;
  trades: TradeResult[];
}

interface TradeResult {
  label: string;
  slPct: number;
  tpPct: number;
  outcome: TradeOutcome;
  /** Candle index relative to entry where SL/TP hit (undefined if open) */
  exitBar?: number;
}

interface TradeSummary {
  label: string;
  slPct: number;
  tpPct: number;
  total: number;
  wins: number;
  losses: number;
  open: number;
  winRate: number;
  lossRate: number;
  /** Expected value per trade as % of entry (wins*tp - losses*sl) / total */
  expectancy: number;
}

interface Summary {
  totalAlerts: number;
  avgMaxFavorableMove: number;
  avgMaxAdverseMove: number;
  directionalAccuracy: number;
  thresholdAccuracy: Record<string, number>;
  trades: TradeSummary[];
}

// --- Trade simulation ---

/** Build the list of {label, sl, tp} configs to simulate */
function getTradeConfigs(): { label: string; sl: number; tp: number }[] {
  const configs: { label: string; sl: number; tp: number }[] = [];

  for (const pct of SYMMETRIC_LEVELS) {
    configs.push({ label: `${pct}:${pct}`, sl: pct, tp: pct });
  }
  for (const { sl, tp } of ASYMMETRIC_RATIOS) {
    configs.push({ label: `${sl}:${tp}`, sl, tp });
  }
  return configs;
}

/**
 * Simulate a single trade: walk candles from entry, check if TP or SL hit first.
 *
 * For a LONG trade: TP when price >= entry*(1+tp/100), SL when price <= entry*(1-sl/100)
 * For a SHORT trade: TP when price <= entry*(1-tp/100), SL when price >= entry*(1+sl/100)
 *
 * If both could trigger on the same candle, we conservatively count it as a LOSS
 * (the adverse wick likely hit first in volatile conditions).
 */
function simulateTrade(
  ohlc: Alert["ohlc"],
  entryIdx: number,
  entryPrice: number,
  isLong: boolean,
  slPct: number,
  tpPct: number,
): { outcome: TradeOutcome; exitBar?: number } {
  const tpPrice = isLong
    ? entryPrice * (1 + tpPct / 100)
    : entryPrice * (1 - tpPct / 100);
  const slPrice = isLong
    ? entryPrice * (1 - slPct / 100)
    : entryPrice * (1 + slPct / 100);

  for (let i = entryIdx; i < ohlc.length; i++) {
    const c = ohlc[i];
    const bar = i - entryIdx;

    const hitTp = isLong ? c.high >= tpPrice : c.low <= tpPrice;
    const hitSl = isLong ? c.low <= slPrice : c.high >= slPrice;

    if (hitTp && hitSl) return { outcome: "loss", exitBar: bar }; // conservative
    if (hitSl) return { outcome: "loss", exitBar: bar };
    if (hitTp) return { outcome: "win", exitBar: bar };
  }

  return { outcome: "open" };
}

// --- Alert analysis ---

function analyzeAlert(alert: Alert): AlertResult | null {
  const { ohlc } = alert;
  const alertIdx = ohlc.findIndex((c) => c.time === alert.time);
  if (alertIdx === -1) throw new Error(`Alert candle not found: ${alert.id}`);

  const entryIdx = alertIdx + 1;
  if (entryIdx >= ohlc.length) {
    console.error(`No candle after alert: ${alert.id}`);
    return null;
  }

  const entryPrice = ohlc[entryIdx].open;
  const isLong = alert.type.includes("LONG");
  const expectedDirection: Direction = isLong ? "up" : "down";

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

  // Simulate all trade configs
  const configs = getTradeConfigs();
  const trades: TradeResult[] = configs.map((cfg) => {
    const { outcome, exitBar } = simulateTrade(
      ohlc,
      entryIdx,
      entryPrice,
      isLong,
      cfg.sl,
      cfg.tp,
    );
    return { label: cfg.label, slPct: cfg.sl, tpPct: cfg.tp, outcome, exitBar };
  });

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
    trades,
  };
}

// --- Aggregation ---

function aggregateTrades(results: AlertResult[]): TradeSummary[] {
  const configs = getTradeConfigs();
  return configs.map((cfg) => {
    let wins = 0,
      losses = 0,
      open = 0;

    for (const r of results) {
      const t = r.trades.find((tr) => tr.label === cfg.label);
      if (!t) continue;
      if (t.outcome === "win") wins++;
      else if (t.outcome === "loss") losses++;
      else open++;
    }

    const total = results.length;
    const resolved = wins + losses;
    const winRate = resolved > 0 ? (wins / resolved) * 100 : 0;
    const lossRate = resolved > 0 ? (losses / resolved) * 100 : 0;
    // Expectancy: average P&L per trade as % of entry
    const expectancy =
      total > 0 ? (wins * cfg.tp - losses * cfg.sl) / total : 0;

    return {
      label: cfg.label,
      slPct: cfg.sl,
      tpPct: cfg.tp,
      total,
      wins,
      losses,
      open,
      winRate,
      lossRate,
      expectancy,
    };
  });
}

export function analyzeAlerts(alerts: Alert[]): {
  results: AlertResult[];
  summary: Summary;
} {
  const results = alerts
    .map(analyzeAlert)
    .filter((r): r is AlertResult => r !== null);
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
        trades: [],
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
      trades: aggregateTrades(results),
    },
  };
}

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
//
// // Directional stats
// console.log(long.summary.directionalAccuracy);     // 69.4
// console.log(long.summary.avgMaxFavorableMove);      // 12.8
//
// // Trade simulations
// long.summary.trades.forEach(t => {
//   console.log(`${t.label} | Win: ${t.winRate.toFixed(1)}% | Exp: ${t.expectancy.toFixed(2)}%`);
// });
//
// // Example output:
// // 1:1  | Win: 72.3% | Exp: 0.45%
// // 2:2  | Win: 68.1% | Exp: 0.72%
// // 1:2  | Win: 61.5% | Exp: 0.46%   ← 1% risk, 2% reward
// // 1:3  | Win: 52.0% | Exp: 0.56%   ← 1% risk, 3% reward
