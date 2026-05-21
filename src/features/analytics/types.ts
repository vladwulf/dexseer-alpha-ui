export type AnalyticsVolumeMetric = "asset_volume" | "quote_volume";

export type AnalyticsHourlyMoversBucket = {
  hour: number;
  gainers: number;
  losers: number;
  medianReturn: number;
  topGainer: { symbol: string; changePct: number } | null;
  topLoser: { symbol: string; changePct: number } | null;
};

export type AnalyticsHourlyMoversResponse = {
  threshold: number;
  lookbackDays: number;
  buckets: AnalyticsHourlyMoversBucket[];
};

export type AnalyticsBtcCorrelationAsset = {
  symbol: string;
  correlation: number | null;
};

export type AnalyticsBtcCorrelationResponse = {
  lookbackDays: number;
  assets: AnalyticsBtcCorrelationAsset[];
};

export type AnalyticsBreakoutHourBucket = {
  hour: number;
  frequency: number;
  avgRangeExpansion: number;
};

export type AnalyticsBreakoutHoursResponse = {
  lookbackDays: number;
  buckets: AnalyticsBreakoutHourBucket[];
};

export type AnalyticsHourlyVolumeAsset = {
  assetId: number;
  symbol: string;
  volume: number;
};

export type AnalyticsHourlyVolumeBucket = {
  hour: number;
  totalVolume: number;
  assets: AnalyticsHourlyVolumeAsset[];
};

export type AnalyticsHourlyVolumeActivityResponse = {
  metric: AnalyticsVolumeMetric;
  lookbackDays: number;
  assetLimit: number;
  buckets: AnalyticsHourlyVolumeBucket[];
};
