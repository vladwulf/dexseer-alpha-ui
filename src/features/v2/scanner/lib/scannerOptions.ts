import type { ScannerPreset, ScannerTimeframe, SortOption } from "../types";

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
