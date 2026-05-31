import type { OHLCVExtended } from "@/types/ohlcv";
import type {
  MarketStripItem,
  ScannerAsset,
  ScannerPreset,
  ScannerTimeframe,
  SortOption,
} from "../types";

export const MARKET_STRIP: MarketStripItem[] = [
  {
    symbol: "BTC",
    price: "67,412",
    change15m: 0.4,
    change1h: 1.2,
    change24h: 2.8,
  },
  {
    symbol: "ETH",
    price: "3,512",
    change15m: 0.2,
    change1h: 0.8,
    change24h: 1.9,
  },
  {
    symbol: "SOL",
    price: "178.42",
    change15m: 0.7,
    change1h: 2.6,
    change24h: 7.4,
  },
];

export const PRESET_OPTIONS: ScannerPreset[] = [
  "Gainers",
  "Momentum",
  "Breakouts",
  "Pullbacks",
  "OI Expansion",
  "Funding Extremes",
  "Squeeze Candidates",
  "BTC Decouplers",
  "High RVOL",
];

export const TIMEFRAME_OPTIONS: ScannerTimeframe[] = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
];

export const WATCHLIST_OPTIONS = [
  "All assets",
  "Core watchlist",
  "Breakout deck",
  "Muted off",
] as const;

export const MIN_VOLUME_OPTIONS = ["10M+", "50M+", "100M+", "250M+"] as const;

export const SORT_OPTIONS: SortOption[] = [
  "Setup score",
  "Alert count",
  "24h momentum",
  "RVOL",
  "Funding",
  "BTC correlation",
];

function buildMockKlines(closes: number[]): OHLCVExtended[] {
  const now = Date.now();

  return closes.map((close, index) => {
    const previousClose = closes[Math.max(index - 1, 0)] ?? close;
    const open = index === 0 ? close * 0.992 : previousClose;
    const high = Math.max(open, close) * 1.006;
    const low = Math.min(open, close) * 0.994;

    return {
      asset_id: 0,
      time: new Date(
        now - (closes.length - index) * 60 * 60 * 1000,
      ).toISOString(),
      open,
      high,
      low,
      close,
      analytics_updated_at: null,
      asset_volume: 1_000_000 + index * 25_000,
      quote_volume: 2_000_000 + index * 40_000,
      rel_vol_16p: null,
      rel_vol_96p: null,
      is_16p_breakout: false,
      is_16p_breakdown: false,
      is_96p_breakout: false,
      is_96p_breakdown: false,
      ema9: null,
      ema20: null,
      macd_signal: null,
      macd_line: null,
      macd_histogram: null,
    };
  });
}

export const SCANNER_ASSETS: ScannerAsset[] = [
  {
    symbol: "DOGEUSDT",
    market: "PERP",
    price: 0.1842,
    change5m: 0.6,
    change15m: 1.4,
    change1h: 3.8,
    change4h: 5.2,
    change24h: 12.4,
    volume: "482M",
    rvol: 2.6,
    oiDelta: 14,
    funding: 0.012,
    atrPercent: 3.8,
    btcCorrelation: 0.42,
    alertCount: 3,
    setupLabel: "Breakout + OI Confirm",
    setupScore: 84,
    rankingReason:
      "1h breakout with 2.6x RVOL, open interest still building, funding not stretched.",
    activeSetupSummary:
      "1h breakout, RVOL 2.6x, OI +14%, funding still neutral.",
    btcRelativeBehavior:
      "Held bid during BTC chop and continued making higher intraday lows.",
    sessionEdge:
      "London to NY overlap drives 73% of the last 30 breakout continuations.",
    bestHours: [2, 4, 6, 8, 9, 12, 14, 16, 17, 15, 13, 10, 8, 6, 5, 4],
    sparkline: [24, 28, 27, 34, 33, 42, 48, 46, 54, 59, 57, 64],
    chart: buildMockKlines([
      0.171, 0.172, 0.1715, 0.175, 0.174, 0.178, 0.177, 0.181, 0.1805, 0.182,
      0.1818, 0.1842,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Breakout · daily high", time: "15:38" },
      { timeframe: "1h", label: "OI surge +12% in 1h", time: "15:22" },
      { timeframe: "1d", label: "RVOL > 2x sustained", time: "14:58" },
    ],
  },
  {
    symbol: "PEPEUSDT",
    market: "PERP",
    price: 0.0000114,
    change5m: 0.9,
    change15m: 2.6,
    change1h: 6.2,
    change4h: 9.8,
    change24h: 18.1,
    volume: "388M",
    rvol: 3.4,
    oiDelta: 22,
    funding: 0.041,
    atrPercent: 4.6,
    btcCorrelation: 0.31,
    alertCount: 4,
    setupLabel: "Short Squeeze Candidate",
    setupScore: 91,
    rankingReason:
      "Fast tape, high RVOL, and aggressive short covering across 15m and 1h windows.",
    activeSetupSummary:
      "Squeeze structure is still intact, but funding is moving toward crowded territory.",
    btcRelativeBehavior:
      "Strong positive drift even while BTC cooled after the prior impulse leg.",
    sessionEdge:
      "US morning has delivered the cleanest follow-through in 9 of the last 12 squeezes.",
    bestHours: [1, 2, 3, 4, 6, 8, 11, 13, 15, 16, 15, 12, 9, 7, 5, 3],
    sparkline: [18, 22, 30, 32, 40, 48, 56, 58, 62, 68, 72, 80],
    chart: buildMockKlines([
      0.0000094, 0.0000096, 0.0000098, 0.00001, 0.0000099, 0.0000103, 0.0000106,
      0.0000108, 0.0000107, 0.000011, 0.0000112, 0.0000114,
    ]),
    recentAlerts: [
      { timeframe: "5m", label: "Perp squeeze ignition", time: "15:41" },
      { timeframe: "15m", label: "RVOL crossed 3x", time: "15:24" },
      { timeframe: "1h", label: "Funding expansion warning", time: "15:10" },
    ],
  },
  {
    symbol: "SOLUSDT",
    market: "PERP",
    price: 178.42,
    change5m: 0.1,
    change15m: 0.4,
    change1h: 1.1,
    change4h: 2.3,
    change24h: 4.8,
    volume: "1.2B",
    rvol: 1.3,
    oiDelta: 6,
    funding: 0.008,
    atrPercent: 2.9,
    btcCorrelation: 0.68,
    alertCount: 2,
    setupLabel: "VWAP Reclaim",
    setupScore: 68,
    rankingReason:
      "Cleaner structure than the headline momentum names and still early in the reclaim cycle.",
    activeSetupSummary:
      "Acceptance above intraday VWAP with steady OI and controlled funding.",
    btcRelativeBehavior: "Moving with BTC, but holding premium during dips.",
    sessionEdge:
      "Best continuation rate appears around the first two NY cash hours.",
    bestHours: [1, 1, 2, 3, 5, 8, 10, 11, 14, 13, 12, 10, 8, 7, 5, 3],
    sparkline: [30, 28, 34, 32, 40, 38, 46, 44, 50, 48, 56, 54],
    chart: buildMockKlines([
      168, 169, 170, 171, 170.4, 172.2, 173.4, 174.1, 173.8, 176.4, 177.1,
      178.42,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "VWAP reclaim", time: "15:16" },
      { timeframe: "1h", label: "Trend continuation", time: "14:44" },
      { timeframe: "4h", label: "Relative strength vs BTC", time: "13:52" },
    ],
  },
  {
    symbol: "WIFUSDT",
    market: "PERP",
    price: 2.214,
    change5m: 0.4,
    change15m: 1.1,
    change1h: 2.6,
    change4h: 4.4,
    change24h: 9.8,
    volume: "124M",
    rvol: 2.1,
    oiDelta: 11,
    funding: 0.018,
    atrPercent: 4.1,
    btcCorrelation: 0.37,
    alertCount: 2,
    setupLabel: "Compression Breakout",
    setupScore: 78,
    rankingReason:
      "Vol expansion is beginning from a tight intraday base, with room before funding becomes a problem.",
    activeSetupSummary:
      "Range compression resolved higher, supported by fresh OI rather than pure short-covering.",
    btcRelativeBehavior:
      "Low correlation spike; can continue independently if meme beta stays active.",
    sessionEdge:
      "London close often marks the decision point for whether the move extends.",
    bestHours: [1, 2, 2, 3, 5, 6, 8, 10, 12, 12, 11, 9, 8, 6, 4, 3],
    sparkline: [14, 16, 17, 19, 18, 24, 28, 27, 32, 36, 39, 42],
    chart: buildMockKlines([
      1.92, 1.95, 1.97, 1.99, 1.98, 2.04, 2.08, 2.1, 2.09, 2.14, 2.18, 2.214,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Compression break", time: "15:32" },
      { timeframe: "1h", label: "OI trend higher", time: "15:04" },
      { timeframe: "4h", label: "High beta watch", time: "14:37" },
    ],
  },
  {
    symbol: "ENAUSDT",
    market: "PERP",
    price: 0.7912,
    change5m: -0.1,
    change15m: -0.4,
    change1h: 0.6,
    change4h: -1.2,
    change24h: -2.1,
    volume: "64M",
    rvol: 0.9,
    oiDelta: 1,
    funding: -0.002,
    atrPercent: 3.3,
    btcCorrelation: 0.55,
    alertCount: 1,
    setupLabel: "Pullback Break",
    setupScore: 41,
    rankingReason:
      "Not yet actionable, but the structure is close enough to keep on deck.",
    activeSetupSummary:
      "Needs reclaim through local supply before the pullback thesis becomes tradeable.",
    btcRelativeBehavior:
      "Lagging BTC and still dependent on broader tape stabilization.",
    sessionEdge: "More reactive during Asia open than other sessions.",
    bestHours: [1, 1, 1, 2, 3, 5, 6, 7, 9, 9, 8, 7, 6, 5, 4, 2],
    sparkline: [24, 24, 25, 24, 23, 24, 25, 24, 24, 23, 22, 22],
    chart: buildMockKlines([
      0.812, 0.808, 0.804, 0.799, 0.801, 0.796, 0.794, 0.792, 0.788, 0.79,
      0.789, 0.7912,
    ]),
    recentAlerts: [
      { timeframe: "1h", label: "Pullback into support", time: "14:26" },
      { timeframe: "4h", label: "Monitor reclaim trigger", time: "13:08" },
      { timeframe: "1d", label: "Watchlist retained", time: "11:45" },
    ],
  },
  {
    symbol: "FARTCOINUSDT",
    market: "PERP",
    price: 1.284,
    change5m: 1.1,
    change15m: 2.9,
    change1h: 5.8,
    change4h: 10.2,
    change24h: 14.6,
    volume: "246M",
    rvol: 3.1,
    oiDelta: 18,
    funding: 0.028,
    atrPercent: 5.2,
    btcCorrelation: 0.24,
    alertCount: 5,
    setupLabel: "Impulse Continuation",
    setupScore: 88,
    rankingReason:
      "Fast continuation name with persistent RVOL and still-expanding open interest.",
    activeSetupSummary:
      "Momentum remains one-way with fresh positioning and no material rejection yet.",
    btcRelativeBehavior:
      "Trading as an independent beta pocket rather than following BTC tick for tick.",
    sessionEdge:
      "US hours have produced the sharpest extension legs over the past two weeks.",
    bestHours: [2, 3, 4, 5, 8, 10, 13, 15, 17, 18, 16, 13, 10, 8, 6, 4],
    sparkline: [18, 19, 21, 24, 29, 33, 36, 42, 47, 55, 61, 68],
    chart: buildMockKlines([
      1.02, 1.03, 1.04, 1.06, 1.08, 1.12, 1.14, 1.18, 1.19, 1.23, 1.26, 1.284,
    ]),
    recentAlerts: [
      { timeframe: "5m", label: "Trend acceleration", time: "15:47" },
      { timeframe: "15m", label: "RVOL held above 3x", time: "15:26" },
      { timeframe: "1h", label: "Fresh highs accepted", time: "15:02" },
    ],
  },
  {
    symbol: "XRPUSDT",
    market: "PERP",
    price: 0.6421,
    change5m: 0.2,
    change15m: 0.6,
    change1h: 1.3,
    change4h: 2.4,
    change24h: 6.3,
    volume: "918M",
    rvol: 1.4,
    oiDelta: 7,
    funding: 0.006,
    atrPercent: 2.4,
    btcCorrelation: 0.71,
    alertCount: 2,
    setupLabel: "Range Expansion",
    setupScore: 63,
    rankingReason:
      "Broad-market beta name participating in the upside without becoming crowded.",
    activeSetupSummary:
      "Range acceptance above prior resistance with healthier spot participation.",
    btcRelativeBehavior:
      "Correlated with BTC but retaining bid on shallow pullbacks.",
    sessionEdge:
      "Continuation quality improves after the first NY impulse rather than at open.",
    bestHours: [1, 1, 2, 3, 4, 6, 8, 10, 12, 13, 12, 10, 8, 6, 4, 2],
    sparkline: [22, 23, 23, 24, 26, 28, 31, 33, 35, 36, 38, 40],
    chart: buildMockKlines([
      0.598, 0.602, 0.607, 0.611, 0.615, 0.618, 0.621, 0.626, 0.629, 0.635,
      0.639, 0.6421,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Range break confirmed", time: "15:28" },
      { timeframe: "1h", label: "Spot-led lift", time: "14:58" },
      { timeframe: "4h", label: "Trend reset complete", time: "13:41" },
    ],
  },
  {
    symbol: "TONUSDT",
    market: "PERP",
    price: 6.714,
    change5m: -0.3,
    change15m: -0.9,
    change1h: -1.8,
    change4h: -3.2,
    change24h: -4.4,
    volume: "138M",
    rvol: 1.2,
    oiDelta: -5,
    funding: -0.009,
    atrPercent: 3.1,
    btcCorrelation: 0.58,
    alertCount: 1,
    setupLabel: "Failed Breakout",
    setupScore: 36,
    rankingReason:
      "Lost acceptance back inside prior range and is now trading with weak follow-through.",
    activeSetupSummary:
      "Rejection from local highs turned into a grinding unwind with fading participation.",
    btcRelativeBehavior:
      "Underperforming even during BTC stabilization attempts.",
    sessionEdge:
      "Tends to leak lower through Asia after failed NY continuation attempts.",
    bestHours: [1, 1, 1, 2, 3, 4, 5, 6, 8, 8, 7, 6, 5, 4, 3, 2],
    sparkline: [48, 47, 46, 44, 43, 42, 41, 40, 39, 38, 37, 36],
    chart: buildMockKlines([
      7.08, 7.02, 6.98, 6.94, 6.9, 6.86, 6.83, 6.79, 6.77, 6.75, 6.73, 6.714,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Failed reclaim", time: "15:19" },
      { timeframe: "1h", label: "Lower high set", time: "14:47" },
      { timeframe: "4h", label: "Distribution risk", time: "13:29" },
    ],
  },
  {
    symbol: "AVAXUSDT",
    market: "PERP",
    price: 34.81,
    change5m: -0.4,
    change15m: -1,
    change1h: -2.6,
    change4h: -4.8,
    change24h: -8.9,
    volume: "312M",
    rvol: 1.8,
    oiDelta: -11,
    funding: -0.017,
    atrPercent: 4.4,
    btcCorrelation: 0.63,
    alertCount: 3,
    setupLabel: "Breakdown Continuation",
    setupScore: 29,
    rankingReason:
      "Lost higher timeframe support and saw open interest expand on the way down.",
    activeSetupSummary:
      "Pressure remains persistent with weak bounce quality and heavy supply overhead.",
    btcRelativeBehavior:
      "Selling faster than BTC during intraday stress windows.",
    sessionEdge:
      "Most downside extension has printed during Europe open and early NY.",
    bestHours: [1, 1, 2, 2, 3, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 3],
    sparkline: [44, 43, 42, 41, 39, 38, 36, 35, 34, 33, 31, 30],
    chart: buildMockKlines([
      38.7, 38.1, 37.6, 37.1, 36.8, 36.3, 35.9, 35.5, 35.2, 35.0, 34.9, 34.81,
    ]),
    recentAlerts: [
      { timeframe: "5m", label: "Breakdown extension", time: "15:39" },
      { timeframe: "1h", label: "OI added on red candles", time: "15:11" },
      { timeframe: "4h", label: "Support lost", time: "14:06" },
    ],
  },
  {
    symbol: "ARBUSDT",
    market: "PERP",
    price: 0.963,
    change5m: -0.6,
    change15m: -1.4,
    change1h: -3.1,
    change4h: -6.4,
    change24h: -11.7,
    volume: "206M",
    rvol: 2.2,
    oiDelta: -15,
    funding: -0.021,
    atrPercent: 4.8,
    btcCorrelation: 0.49,
    alertCount: 4,
    setupLabel: "Relative Weakness",
    setupScore: 24,
    rankingReason:
      "Weak bounce structure and heavy perpetual participation keep it near the bottom of the board.",
    activeSetupSummary:
      "Unable to reclaim intraday supply, with each bounce sold faster than the last.",
    btcRelativeBehavior: "Persistently weaker than majors and weak-beta peers.",
    sessionEdge:
      "Asia-to-Europe handoff has been the cleanest continuation window for shorts.",
    bestHours: [1, 1, 1, 2, 3, 4, 6, 8, 9, 10, 9, 8, 6, 5, 4, 3],
    sparkline: [40, 39, 38, 36, 35, 33, 31, 29, 28, 27, 25, 24],
    chart: buildMockKlines([
      1.11, 1.09, 1.08, 1.06, 1.04, 1.03, 1.01, 1.0, 0.989, 0.981, 0.972, 0.963,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Supply rejection", time: "15:34" },
      { timeframe: "1h", label: "Relative weakness confirmed", time: "15:00" },
      { timeframe: "4h", label: "Trend damage widening", time: "13:48" },
    ],
  },
  {
    symbol: "SUIUSDT",
    market: "PERP",
    price: 1.438,
    change5m: -0.2,
    change15m: -0.7,
    change1h: -1.9,
    change4h: -3.8,
    change24h: -6.1,
    volume: "174M",
    rvol: 1.5,
    oiDelta: -8,
    funding: -0.011,
    atrPercent: 3.9,
    btcCorrelation: 0.46,
    alertCount: 2,
    setupLabel: "Trend Failure",
    setupScore: 32,
    rankingReason:
      "Follow-through buyers disappeared after the prior breakout attempt failed.",
    activeSetupSummary:
      "Lower highs are stacking and bounces are shallow versus recent volatility.",
    btcRelativeBehavior:
      "Lagging BTC and lagging the higher-beta alt basket at the same time.",
    sessionEdge:
      "Most decisive directional moves have printed into the NY morning.",
    bestHours: [1, 1, 2, 2, 3, 4, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3],
    sparkline: [42, 41, 40, 39, 37, 36, 35, 34, 33, 32, 31, 30],
    chart: buildMockKlines([
      1.56, 1.55, 1.53, 1.52, 1.5, 1.49, 1.48, 1.47, 1.46, 1.45, 1.444, 1.438,
    ]),
    recentAlerts: [
      { timeframe: "15m", label: "Lower high accepted", time: "15:22" },
      { timeframe: "1h", label: "Trend failure watch", time: "14:51" },
      { timeframe: "4h", label: "Momentum unwind", time: "13:34" },
    ],
  },
];

export function getScannerAssetBySymbol(symbol: string) {
  const normalizedSymbol = symbol.trim().toUpperCase();

  return SCANNER_ASSETS.find(
    (asset) => asset.symbol.toUpperCase() === normalizedSymbol,
  );
}
