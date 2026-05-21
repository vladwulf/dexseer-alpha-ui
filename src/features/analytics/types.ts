export type AnalyticsVolumeMetric = "asset_volume" | "quote_volume";

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
