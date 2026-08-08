import type { OHLCVExtended } from "@/types/ohlcv";

export type ScannerTimeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type ScannerPreset =
  | "Classic Rolling"
  | "Bullish Momentum"
  | "Bearish Momentum"
  | "Alerts"
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

export type MomentumIntelligenceState =
  | "neutral"
  | "bullish_slow"
  | "bullish_default"
  | "bullish_unusual"
  | "bearish_slow"
  | "bearish_default"
  | "bearish_unusual";

export type MomentumIntelligenceSnapshot = {
  state?: MomentumIntelligenceState;
  direction?: "long" | "short" | null;
  severity?: "slow" | "default" | "unusual" | null;
  updatedAt?: string | null;
};

export type MomentumIntelligence = {
  fiveMinutes: MomentumIntelligenceSnapshot | null;
  fifteenMinutes: MomentumIntelligenceSnapshot | null;
  oneHour: MomentumIntelligenceSnapshot | null;
};

export type MomentumUnusualTimeframes = {
  "5m": "bullish" | "bearish" | null;
  "15m": "bullish" | "bearish" | null;
  "1h": "bullish" | "bearish" | null;
};

export type MomentumUnusualDirection = "none" | "bullish" | "bearish" | "mixed";

export type MomentumStrength =
  | "balanced"
  | "tentative"
  | "developing"
  | "moderate"
  | "strong"
  | "very strong"
  | "extreme";

export type MomentumRegime =
  | "forming"
  | "balanced"
  | "directional"
  | "continuation"
  | "acceleration"
  | "pullback"
  | "divergence"
  | "covering"
  | "choppy";

export type MomentumRead = {
  headline: string;
  summary: string;
  tone: "positive" | "negative" | "neutral";
  confidence: "low" | "medium" | "high";
  drivers: { label: string; value: string }[];
  regime: MomentumRegime;
  strength: MomentumStrength;
};

export type ScannerAsset = {
  assetId?: number;
  instrumentId?: string;
  symbol: string;
  market: "PERP";
  price: number | null;
  change5m: number | null;
  change15m: number | null;
  change1h: number | null;
  change4h: number | null;
  change24h: number | null;
  momentumScore: number | null;
  momentumScoreCore?: number | null;
  momentumScoreCoverage?: number | null;
  momentumScoreConfirmedCoverage?: number | null;
  momentumScoreVersion?: number | null;
  momentumUnusualTimeframes?: MomentumUnusualTimeframes | null;
  momentumUnusualCoverage?: number | null;
  momentumUnusualDirection?: MomentumUnusualDirection | null;
  volume: number | null;
  rvol: number | null;
  openInterest: number | null;
  oiDelta: number | null;
  funding: number | null;
  volume1m: number | null;
  volume5m: number | null;
  volume15m: number | null;
  volume30m: number | null;
  volume1h: number | null;
  volume4h: number | null;
  rvol1m: number | null;
  rvol5m: number | null;
  rvol15m: number | null;
  rvol30m: number | null;
  rvol1h: number | null;
  rvol4h: number | null;
  oiDelta5m: number | null;
  oiDelta15m: number | null;
  oiDelta30m: number | null;
  oiDelta1h: number | null;
  oiDelta4h: number | null;
  fundingDelta8h: number | null;
  atrPercent: number | null;
  btcCorrelation: number | null;
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
  alignedTimeframes?: number;
  momentumChoppiness?: number | null;
  momentumIntelligence?: MomentumIntelligence;
};
