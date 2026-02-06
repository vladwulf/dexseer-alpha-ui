export type AlertType = "VOLUME_SURGE_SHORT" | string; // Add other alert types as needed

export type Timeframe =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d"
  | string;

export type OHLCV = {
  open: string;
  high: string;
  low: string;
  close: string;
  quote_volume: string;
  time: number;
  volume: string;
};

export type OHLCVExtended = {
  asset_id: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  analytics_updated_at: string | null;
  asset_volume: number;
  quote_volume: number;
  rel_vol_16p: number;
  rel_vol_96p: number;
  is_16p_breakout: boolean;
  is_16p_breakdown: boolean;
  is_96p_breakout: boolean;
  is_96p_breakdown: boolean;
  ema9: number;
  ema20: number;
  macd_signal: number;
  macd_line: number;
  macd_histogram: number;
};

export interface Alert {
  id: number;
  created_at: string;
  time: string;
  timeframe: Timeframe;
  asset_id: number;
  type: AlertType;
  asset: Asset;
  ohlc: OHLCVExtended[];
}

export type Asset = {
  id: number;
  created_at: string;
  last_ohlc_update: string;
  symbol: string;
  isActive: boolean;
  isVerifiedAt: string | null;
  isDisabledAt: string | null;
  disabledReason: string | null;
  price: number;
  change_1m: number;
  change_5m: number;
  change_15m: number;
  change_30m: number;
  change_1h: number;
  change_4h: number;
  change_1d: number;
  volume_1m: number;
  volume_5m: number;
  volume_15m: number;
  volume_30m: number;
  volume_1h: number;
  volume_4h: number;
  volume_1d: number;
  volume_delta_1m: number | null;
  volume_delta_5m: number | null;
  volume_delta_15m: number | null;
  volume_delta_30m: number | null;
  volume_delta_1h: number | null;
  volume_delta_4h: number | null;
  volume_delta_1d: number | null;
};

export type AlertWithWindow = Alert & {
  asset: Asset;
  ohlc: OHLCVExtended[];
};
