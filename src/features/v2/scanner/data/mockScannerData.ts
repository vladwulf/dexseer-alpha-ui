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
    change24h: 2.1,
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
];
