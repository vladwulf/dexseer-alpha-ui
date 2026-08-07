import type { SortingState } from "@tanstack/react-table";
import type { OHLCVExtended } from "@/types/ohlcv";
import type {
  MarketStripResponse,
  MomentumEntry,
  ScannerAssetDetailsResponse,
  ScannerBatchChartsResponse,
  ScannerCandle,
  ScannerChartResponse,
  ScannerChartTimeframe,
  ScannerPresetKey,
  ScannerRow,
  ScannerSortBy,
  ScannerSortDirection,
} from "../hooks/scanner.api";
import type {
  MarketStripItem,
  ScannerAsset,
  ScannerPreset,
  SortOption,
} from "../types";

const presetKeyByLabel: Record<ScannerPreset, ScannerPresetKey> = {
  "Classic Rolling": "gainers",
  "Bullish Momentum": "momentum",
  "Bearish Momentum": "momentum",
  Alerts: "gainers",
  Breakouts: "breakouts",
  Pullbacks: "pullbacks",
  "OI Expansion": "oi_expansion",
  "Funding Extremes": "funding_extremes",
  "Squeeze Candidates": "squeeze_candidates",
  "BTC Decouplers": "btc_decouplers",
  "High RVOL": "high_rvol",
};

const sortKeyByLabel: Partial<Record<SortOption, ScannerSortBy>> = {
  "24h momentum": "change_24h",
  RVOL: "rvol_24h",
  Funding: "funding_rate",
};

const scannerColumnSortKeyById: Record<string, ScannerSortBy> = {
  symbol: "symbol",
  price: "price",
  change5m: "change_5m",
  change15m: "change_15m",
  change1h: "change_1h",
  change4h: "change_4h",
  change24h: "change_24h",
  momentumScore: "momentum_score",
  volume1m: "volume_1m",
  volume5m: "volume_5m",
  volume15m: "volume_15m",
  volume30m: "volume_30m",
  volume1h: "volume_1h",
  volume4h: "volume_4h",
  volume: "volume_24h",
  rvol1m: "rvol_1m",
  rvol5m: "rvol_5m",
  rvol15m: "rvol_15m",
  rvol30m: "rvol_30m",
  rvol1h: "rvol_1h",
  rvol4h: "rvol_4h",
  rvol: "rvol_24h",
  openInterest: "open_interest",
  oiDelta5m: "oi_change_5m",
  oiDelta15m: "oi_change_15m",
  oiDelta30m: "oi_change_30m",
  oiDelta1h: "oi_change_1h",
  oiDelta4h: "oi_change_4h",
  oiDelta: "oi_change_24h",
  funding: "funding_rate",
  fundingDelta8h: "funding_rate_delta_8h",
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
  return sortKeyByLabel[sortBy] ?? "change_24h";
}

export function getScannerSortParams(sorting: SortingState): {
  sort_by?: ScannerSortBy;
  sort_direction?: ScannerSortDirection;
} {
  const firstSort = sorting[0];

  if (!firstSort) {
    return {};
  }

  const sort_by = scannerColumnSortKeyById[firstSort.id];

  if (!sort_by) {
    return {};
  }

  return {
    sort_by,
    sort_direction: firstSort.desc ? "desc" : "asc",
  };
}

export function getMinVolumeValue(label: keyof typeof volumeThresholdByLabel) {
  return volumeThresholdByLabel[label];
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
    price: row.price,
    change5m: row.change_5m,
    change15m: row.change_15m,
    change1h: row.change_1h,
    change4h: row.change_4h,
    change24h: row.change_24h,
    momentumScore: row.momentum_score ?? null,
    momentumScoreCore: row.momentum_score_core ?? null,
    momentumScoreCoverage: row.momentum_score_coverage ?? null,
    momentumScoreConfirmedCoverage:
      row.momentum_score_confirmed_coverage ?? null,
    momentumScoreVersion: row.momentum_score_version ?? null,
    volume: row.volume_24h,
    rvol: row.rvol_24h,
    openInterest: row.open_interest,
    oiDelta: row.oi_change_24h,
    funding: row.funding_rate,
    volume1m: row.volume_1m,
    volume5m: row.volume_5m,
    volume15m: row.volume_15m,
    volume30m: row.volume_30m,
    volume1h: row.volume_1h,
    volume4h: row.volume_4h,
    rvol1m: row.rvol_1m,
    rvol5m: row.rvol_5m,
    rvol15m: row.rvol_15m,
    rvol30m: row.rvol_30m,
    rvol1h: row.rvol_1h,
    rvol4h: row.rvol_4h,
    oiDelta5m: row.oi_change_5m,
    oiDelta15m: row.oi_change_15m,
    oiDelta30m: row.oi_change_30m,
    oiDelta1h: row.oi_change_1h,
    oiDelta4h: row.oi_change_4h,
    fundingDelta8h: row.funding_rate_delta_8h,
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

export function mapMomentumEntryToAsset(row: MomentumEntry): ScannerAsset {
  return {
    assetId: row.asset_id,
    instrumentId: row.instrument_id,
    symbol: row.symbol,
    market: "PERP",
    price: row.price,
    change5m: row.change_5m,
    change15m: row.change_15m,
    change1h: row.change_1h,
    change4h: null,
    change24h: null,
    momentumScore: null,
    volume: null,
    rvol: row.rvol_24h,
    openInterest: null,
    oiDelta: null,
    funding: null,
    volume1m: null,
    volume5m: null,
    volume15m: null,
    volume30m: null,
    volume1h: null,
    volume4h: null,
    rvol1m: null,
    rvol5m: null,
    rvol15m: null,
    rvol30m: null,
    rvol1h: null,
    rvol4h: null,
    oiDelta5m: null,
    oiDelta15m: null,
    oiDelta30m: null,
    oiDelta1h: null,
    oiDelta4h: null,
    fundingDelta8h: null,
    atrPercent: 0,
    btcCorrelation: 0,
    alertCount: 0,
    setupLabel: row.direction === "long" ? "Bullish momentum" : "Bearish momentum",
    setupScore: row.score,
    rankingReason: `${row.aligned_timeframes}/3 timeframes aligned for ${row.direction} momentum.`,
    activeSetupSummary:
      "Momentum setup scored from 1m, 5m, and 15m indicator snapshots.",
    btcRelativeBehavior: "BTC-relative details are not available yet.",
    sessionEdge: "Session statistics are not available yet.",
    bestHours: [],
    sparkline: [row.score_1m, row.score_5m, row.score_15m],
    chart: [],
    recentAlerts: [],
    momentumDirection: row.direction,
    alignedTimeframes: row.aligned_timeframes,
    momentumChoppiness: row.indicators.choppiness_1m ?? null,
  };
}

export function mergeDetailsIntoAsset(
  asset: ScannerAsset,
  details?: ScannerAssetDetailsResponse,
) {
  if (!details) return asset;

  return {
    ...asset,
    price: details.price,
    change15m: details.stats.change_15m,
    change1h: details.stats.change_1h,
    change4h: details.stats.change_4h,
    change24h: details.stats.change_24h,
    volume: details.stats.volume_24h,
    rvol: details.stats.rvol_24h,
    openInterest: details.stats.open_interest,
    oiDelta: details.stats.oi_change_24h,
    funding: details.stats.funding_rate,
    atrPercent: details.stats.atr_percent_24h ?? asset.atrPercent,
    btcCorrelation: details.stats.btc_correlation_1h ?? asset.btcCorrelation,
  };
}

function mapCandleToOhlcv(
  assetId: number,
  instrumentId: string | undefined,
  candle: ScannerCandle,
): OHLCVExtended {
  return {
    asset_id: assetId,
    instrument_id: instrumentId,
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    analytics_updated_at: null,
    asset_volume: candle.volume_base ?? 0,
    quote_volume: candle.volume_quote ?? 0,
    rel_vol_1p: null,
    rel_vol_16p: null,
    rel_vol_96p: null,
    is_16p_breakout: false,
    is_16p_breakdown: false,
    is_96p_breakout: false,
    is_96p_breakdown: false,
    ema9: null,
    ema20: null,
    ema50: null,
    ema100: null,
    ema200: null,
    macd_signal: null,
    macd_line: null,
    macd_histogram: null,
    macd_signal_slope: null,
    atr14: null,
    choppiness_index_14: null,
    adx14: null,
    range_z: null,
    rvol_z_sustained: null,
    move_z: null,
  };
}

export function mapScannerCandlesToOhlcv(
  assetId: number,
  instrumentId: string | undefined,
  candles: ScannerCandle[],
) {
  return candles.map((candle) =>
    mapCandleToOhlcv(assetId, instrumentId, candle),
  );
}

export function mergeChartSeriesIntoAsset(
  asset: ScannerAsset,
  chart?: OHLCVExtended[],
) {
  if (!chart) return asset;

  return {
    ...asset,
    instrumentId: chart[0]?.instrument_id ?? asset.instrumentId,
    chart,
  };
}

export function mergeChartIntoAsset(
  asset: ScannerAsset,
  chart?: ScannerChartResponse,
) {
  if (!chart) return asset;

  return mergeChartSeriesIntoAsset(
    asset,
    mapScannerCandlesToOhlcv(
      chart.asset_id,
      chart.instrument_id,
      chart.candles,
    ),
  );
}

function hasSameCandleShape(left: OHLCVExtended, right: OHLCVExtended) {
  return (
    left.time === right.time &&
    left.open === right.open &&
    left.high === right.high &&
    left.low === right.low &&
    left.close === right.close &&
    left.asset_volume === right.asset_volume &&
    left.quote_volume === right.quote_volume
  );
}

export function mergePolledChartSeries(
  current: OHLCVExtended[] | undefined,
  incoming: OHLCVExtended[] | undefined,
) {
  if (!incoming || incoming.length === 0) {
    return current ?? [];
  }

  if (!current || current.length === 0) {
    return incoming;
  }

  const currentByTime = new Map(
    current.map((candle, index) => [candle.time, index] as const),
  );
  const next = [...current];
  let didChange = false;
  let canMergeIncrementally = true;

  for (const candle of incoming) {
    const existingIndex = currentByTime.get(candle.time);

    if (existingIndex !== undefined) {
      if (!hasSameCandleShape(next[existingIndex], candle)) {
        next[existingIndex] = candle;
        didChange = true;
      }
      continue;
    }

    const lastCurrentCandle = next[next.length - 1];

    if (!lastCurrentCandle || candle.time > lastCurrentCandle.time) {
      next.push(candle);
      didChange = true;
      continue;
    }

    canMergeIncrementally = false;
    break;
  }

  if (!canMergeIncrementally) {
    return incoming;
  }

  return didChange ? next : current;
}

export function mergeBatchChartsIntoAssets(
  assets: ScannerAsset[],
  charts?: ScannerBatchChartsResponse,
) {
  if (!charts) return assets;

  const chartByAssetId = new Map(
    charts.assets
      .filter((assetChart) => assetChart.status === "ok")
      .map((assetChart) => [
        assetChart.asset_id,
        assetChart.candles.map((candle) =>
          mapCandleToOhlcv(
            assetChart.asset_id,
            assetChart.instrument_id,
            candle,
          ),
        ),
      ]),
  );

  return assets.map((asset) =>
    asset.assetId === undefined
      ? asset
      : mergeChartSeriesIntoAsset(
          asset,
          chartByAssetId.get(asset.assetId) ?? asset.chart,
        ),
  );
}

export function getSupportedScannerChartTimeframe(
  timeframe: string,
): ScannerChartTimeframe {
  return timeframe as ScannerChartTimeframe;
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
