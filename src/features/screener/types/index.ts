import type { OHLCVExtended } from "@/types/ohlcv";

export type ScreenerAsset = {
  id: number;
  created_at: string;
  last_ohlc_update: string;
  symbol: string;
  isActive: boolean;
  price: number;
  change_1m: number;
  change_5m: number;
  change_15m: number;
  change_30m: number;
  change_1h: number;
  change_4h: number;
  change_1d: number | null;
  volume_1m: number;
  volume_5m: number;
  volume_15m: number;
  volume_30m: number;
  volume_1h: number;
  volume_4h: number;
  volume_1d: number;
  volume_delta_1m: number;
  volume_delta_5m: number;
  volume_delta_15m: number;
  volume_delta_30m: number;
  volume_delta_1h: number;
  volume_delta_4h: number;
  volume_delta_1d: number | null;
};

export type ScreenerAssetWithChart = ScreenerAsset & {
  chart: {
    timeframe: string;
    data: OHLCVExtended[];
  };
};
