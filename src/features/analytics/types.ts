export type AnalyticsVolumeMetric = "asset_volume" | "quote_volume";
export type AnalyticsMoversTimeframe = "m" | "15m" | "30m" | "1h" | "4h" | "1d";
export type AnalyticsDistributionMetric = "15m" | "30m" | "1h" | "4h" | "1d";

export type AnalyticsTimeframeMoversBucket = {
  hour: number;
  gainers: number;
  losers: number;
  medianReturn: number;
  topGainer: { symbol: string; changePct: number } | null;
  topLoser: { symbol: string; changePct: number } | null;
};

export type AnalyticsTimeframeMoversResponse = {
  threshold: number;
  lookbackDays: number;
  timeframe: AnalyticsMoversTimeframe;
  buckets: AnalyticsTimeframeMoversBucket[];
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

export type AnalyticsDistributionAsset = {
  asset_id: number;
  symbol: string;
  price: number;
  change_15m?: number;
  change_30m?: number;
  change_1h?: number;
  change_1d?: number;
  change_4h?: number;
};

export type AnalyticsDistributionBucketKey =
  | "gt10"
  | "from7to10"
  | "from5to7"
  | "from3to5"
  | "from0to3"
  | "zero"
  | "fromNeg0to3"
  | "fromNeg3to5"
  | "fromNeg5to7"
  | "fromNeg7to10"
  | "ltNeg10";

export type AnalyticsDistributionBucket = {
  label: string;
  count: number;
  assets: AnalyticsDistributionAsset[];
};

export type AnalyticsDistributionResponse = {
  metric: AnalyticsDistributionMetric;
  updatedAt: string | null;
  total: number;
  priceUp: number;
  unchanged: number;
  priceDown: number;
  buckets: Record<AnalyticsDistributionBucketKey, AnalyticsDistributionBucket>;
};

export type RunnerMetric = "1d" | "4h";
export type RunnerBoard = "long" | "short" | "volume";

export type RunnerEntry = {
  asset_id: number;
  symbol: string;
  price: number;
  change_1d?: number;
  change_4h?: number;
  volume_1d?: number;
  volume_4h?: number;
  rank: number;
};

export type RunnerMetricData = {
  board: RunnerBoard;
  metric: RunnerMetric;
  updatedAt: string | null;
  limit: number;
  entries: RunnerEntry[];
};

export type RunnersResponse = {
  "1d": RunnerMetricData;
  "4h": RunnerMetricData;
};

export type ReplayFrame = {
  sampledAt: string;
  entries: RunnerEntry[];
};
