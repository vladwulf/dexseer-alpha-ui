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
  "Momentum Long": "momentum",
  "Momentum Short": "momentum",
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
  "Alert count": "alert_count",
  "24h momentum": "change_24h",
  RVOL: "rvol_24h",
  Funding: "funding_rate",
  "BTC correlation": "score",
};

const scannerColumnSortKeyById: Record<string, ScannerSortBy> = {
  price: "price",
  change5m: "change_5m",
  change15m: "change_15m",
  change1h: "change_1h",
  change4h: "change_4h",
  change24h: "change_24h",
  volume: "volume_24h",
  rvol: "rvol_24h",
  oiDelta: "oi_change_24h",
  funding: "funding_rate",
  alertCount: "alert_count",
  setupScore: "score",
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
    change5m: row.change_5m ?? 0,
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

export function mapMomentumEntryToAsset(row: MomentumEntry): ScannerAsset {
  return {
    assetId: row.asset_id,
    instrumentId: row.instrument_id,
    symbol: row.symbol,
    market: "PERP",
    price: row.price ?? 0,
    change5m: 0,
    change15m: 0,
    change1h: 0,
    change4h: 0,
    change24h: 0,
    volume: "-",
    rvol: row.indicators.rvol_z_sustained_1m ?? 0,
    oiDelta: 0,
    funding: 0,
    atrPercent: 0,
    btcCorrelation: 0,
    alertCount: 0,
    setupLabel: row.direction === "long" ? "Long momentum" : "Short momentum",
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
    momentumScore1m: row.score_1m,
    momentumScore5m: row.score_5m,
    momentumScore15m: row.score_15m,
    alignedTimeframes: row.aligned_timeframes,
    momentumRangeZ: row.indicators.range_z_1m ?? null,
    momentumMoveZ: row.indicators.move_z_1m ?? null,
    momentumRvolZ: row.indicators.rvol_z_sustained_1m ?? null,
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
