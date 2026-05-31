import type { OHLCVExtended } from "@/types/ohlcv";
import type {
  MarketStripResponse,
  ScannerAssetDetailsResponse,
  ScannerCandle,
  ScannerChartResponse,
  ScannerPresetKey,
  ScannerRow,
  ScannerSortBy,
} from "../hooks/scanner.api";
import type {
  MarketStripItem,
  ScannerAsset,
  ScannerPreset,
  SortOption,
} from "../types";

const presetKeyByLabel: Record<ScannerPreset, ScannerPresetKey> = {
  Gainers: "gainers",
  Momentum: "momentum",
  Breakouts: "breakouts",
  Pullbacks: "pullbacks",
  "OI Expansion": "oi_expansion",
  "Funding Extremes": "funding_extremes",
  "Squeeze Candidates": "squeeze_candidates",
  "BTC Decouplers": "btc_decouplers",
  "High RVOL": "high_rvol",
};

const sortKeyByLabel: Record<SortOption, ScannerSortBy> = {
  "Setup score": "score",
  "Alert count": "score",
  "24h momentum": "change_24h",
  RVOL: "rvol_24h",
  Funding: "funding_rate",
  "BTC correlation": "score",
};

const volumeThresholdByLabel = {
  "10M+": 10_000_000,
  "50M+": 50_000_000,
  "100M+": 100_000_000,
  "250M+": 250_000_000,
} as const;

export function getScannerPresetKey(preset: ScannerPreset) {
  return presetKeyByLabel[preset];
}

export function getScannerSortKey(sortBy: SortOption) {
  return sortKeyByLabel[sortBy];
}

export function getMinVolumeValue(label: keyof typeof volumeThresholdByLabel) {
  return volumeThresholdByLabel[label];
}

function formatCompactVolume(value: number | null) {
  if (value === null) return "-";

  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function toSparkline(row: ScannerRow) {
  const values = [
    row.change_15m,
    row.change_1h,
    row.change_4h,
    row.change_24h,
  ].filter((value): value is number => value !== null);

  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values.map((value) => 24 + ((value - min) / range) * 36);
}

export function mapScannerRowToAsset(row: ScannerRow): ScannerAsset {
  return {
    assetId: row.asset_id,
    symbol: row.symbol,
    market: row.market,
    price: row.price ?? 0,
    change5m: 0,
    change15m: row.change_15m ?? 0,
    change1h: row.change_1h ?? 0,
    change4h: row.change_4h ?? 0,
    change24h: row.change_24h ?? 0,
    volume: formatCompactVolume(row.volume_24h),
    rvol: row.rvol_24h ?? 0,
    oiDelta: row.oi_change_24h ?? 0,
    funding: row.funding_rate ?? 0,
    atrPercent: 0,
    btcCorrelation: 0,
    alertCount: row.alert_count ?? 0,
    setupLabel: "Live scanner",
    setupScore: row.score ?? 0,
    rankingReason: "Live scanner row from the current market snapshot.",
    activeSetupSummary:
      "Detailed setup data is not available for this asset yet.",
    btcRelativeBehavior: "BTC-relative details are not available yet.",
    sessionEdge: "Session statistics are not available yet.",
    bestHours: [],
    sparkline: toSparkline(row),
    chart: [],
    recentAlerts: [],
  };
}

export function mergeDetailsIntoAsset(
  asset: ScannerAsset,
  details?: ScannerAssetDetailsResponse,
) {
  if (!details) return asset;

  return {
    ...asset,
    price: details.price ?? asset.price,
    change15m: details.stats.change_15m ?? asset.change15m,
    change1h: details.stats.change_1h ?? asset.change1h,
    change4h: details.stats.change_4h ?? asset.change4h,
    change24h: details.stats.change_24h ?? asset.change24h,
    volume: formatCompactVolume(details.stats.volume_24h),
    rvol: details.stats.rvol_24h ?? asset.rvol,
    oiDelta: details.stats.oi_change_24h ?? asset.oiDelta,
    funding: details.stats.funding_rate ?? asset.funding,
    atrPercent: details.stats.atr_percent_24h ?? asset.atrPercent,
    btcCorrelation: details.stats.btc_correlation_1h ?? asset.btcCorrelation,
  };
}

function mapCandleToOhlcv(
  assetId: number,
  candle: ScannerCandle,
): OHLCVExtended {
  return {
    asset_id: assetId,
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    analytics_updated_at: null,
    asset_volume: candle.volume ?? 0,
    quote_volume: candle.volume ?? 0,
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
}

export function mergeChartIntoAsset(
  asset: ScannerAsset,
  chart?: ScannerChartResponse,
) {
  if (!chart) return asset;

  return {
    ...asset,
    chart: chart.candles.map((candle) =>
      mapCandleToOhlcv(chart.asset_id, candle),
    ),
  };
}

export function mapMarketStripResponse(
  response?: MarketStripResponse,
): MarketStripItem[] | undefined {
  if (!response) return undefined;

  return response.items.map((item) => ({
    symbol: item.symbol.replace(/USDT$/u, ""),
    price: item.price === null ? "-" : item.price.toLocaleString("en-US"),
    change15m: item.change_15m ?? 0,
    change1h: item.change_1h ?? 0,
    change24h: item.change_24h ?? 0,
  }));
}
