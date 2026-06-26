import type { OHLCVExtended } from "@/types/ohlcv";

export type ScannerTimeframe = "15s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type ScannerPreset =
  | "Classic Rolling"
  | "Momentum Long"
  | "Momentum Short"
  | "Breakouts"
  | "Pullbacks"
  | "OI Expansion"
  | "Funding Extremes"
  | "Squeeze Candidates"
  | "BTC Decouplers"
  | "High RVOL";

export type DensityMode = "compact" | "expanded";
export type RefreshInterval = "manual" | "live";

export type SortOption =
  | "Setup score"
  | "Alert count"
  | "24h momentum"
  | "RVOL"
  | "Funding"
  | "BTC correlation";

export type MarketStripItem = {
  symbol: string;
  price: string;
  change15m: number;
  change1h: number;
  change24h: number;
};

export type ScannerAlert = {
  timeframe: ScannerTimeframe;
  label: string;
  time: string;
};

export type ScannerAsset = {
  assetId?: number;
  instrumentId?: string;
  symbol: string;
  market: "PERP";
  price: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change4h: number;
  change24h: number;
  volume: string;
  rvol: number;
  oiDelta: number;
  funding: number;
  atrPercent: number;
  btcCorrelation: number;
  alertCount: number;
  setupLabel: string;
  setupScore: number;
  rankingReason: string;
  activeSetupSummary: string;
  btcRelativeBehavior: string;
  sessionEdge: string;
  bestHours: number[];
  sparkline: number[];
  chart: OHLCVExtended[];
  recentAlerts: ScannerAlert[];
  momentumDirection?: "long" | "short";
  momentumScore1m?: number;
  momentumScore5m?: number;
  momentumScore15m?: number;
  alignedTimeframes?: number;
  momentumRangeZ?: number | null;
  momentumMoveZ?: number | null;
  momentumRvolZ?: number | null;
  momentumChoppiness?: number | null;
};
