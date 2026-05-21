import { API_URL } from "@/config";
import type { OHLCVExtended } from "@/types/ohlcv";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type AlertTimeframe =
  | "1s"
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d";

export type AlertType =
  | "dailyHighBreak"
  | "dailyLowBreak"
  | "previousDayHighBreak"
  | "previousDayLowBreak"
  | "percentUp10Today"
  | "percentDown10Today"
  | "runningUpNow"
  | "runningDownNow"
  | "dailyVolumeSpike4x"
  | "4hHighBreak"
  | "4hLowBreak"
  | "15minHighBreak"
  | "15minLowBreak"
  | "1hHighBreak"
  | "1hLowBreak";

export type AlertListItem = {
  id: string;
  created_at: string;
  time: string;
  timeframe: string;
  asset_id: number;
  type: AlertType | string;
  price: number;
  asset: {
    id: number;
    symbol: string;
  } | null;
};

export type AlertsResponse = {
  data: AlertListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type AlertChartRow = {
  time: string;
  asset_id: number | string;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
  asset_volume: number | string;
  quote_volume: number | string;
  rel_vol_16p?: number | string | null;
  rel_vol_96p?: number | string | null;
  is_16p_break_up?: boolean | number | string | null;
  is_16p_break_down?: boolean | number | string | null;
  is_96p_break_up?: boolean | number | string | null;
  is_96p_break_down?: boolean | number | string | null;
  ema9?: number | string | null;
  ema20?: number | string | null;
  macd_signal?: number | string | null;
  macd_line?: number | string | null;
  macd_histogram?: number | string | null;
  atr14?: number | string | null;
  [key: string]: unknown;
};

type GetAlertsParams = {
  timeframe: AlertTimeframe;
  limit?: number;
  offset?: number;
  type?: string;
  assetId?: number;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value == null) return 0;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const toNullableNumber = (value: number | string | null | undefined) => {
  if (value == null) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const toBoolean = (value: boolean | number | string | null | undefined) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value === "true" || value === "1";
  return false;
};

const normalizeChartRow = (row: AlertChartRow): OHLCVExtended => ({
  asset_id: toNumber(row.asset_id),
  time: row.time,
  open: toNumber(row.open),
  high: toNumber(row.high),
  low: toNumber(row.low),
  close: toNumber(row.close),
  analytics_updated_at: null,
  asset_volume: toNumber(row.asset_volume),
  quote_volume: toNumber(row.quote_volume),
  rel_vol_16p: toNullableNumber(row.rel_vol_16p),
  rel_vol_96p: toNullableNumber(row.rel_vol_96p),
  is_16p_breakout: toBoolean(row.is_16p_break_up),
  is_16p_breakdown: toBoolean(row.is_16p_break_down),
  is_96p_breakout: toBoolean(row.is_96p_break_up),
  is_96p_breakdown: toBoolean(row.is_96p_break_down),
  ema9: toNullableNumber(row.ema9),
  ema20: toNullableNumber(row.ema20),
  macd_signal: toNullableNumber(row.macd_signal),
  macd_line: toNullableNumber(row.macd_line),
  macd_histogram: toNullableNumber(row.macd_histogram),
});

async function getAlertsPaginated({
  timeframe,
  limit = 50,
  offset = 0,
  type,
  assetId,
}: GetAlertsParams) {
  const response = await axios.get<AlertsResponse>(`${API_URL}/alerts`, {
    params: {
      timeframe,
      limit,
      offset,
      type: type || undefined,
      assetId,
    },
  });
  return response.data;
}

async function getAlertChart(alertId: string, timeframe: AlertTimeframe) {
  const response = await axios.get<AlertChartRow[]>(
    `${API_URL}/alerts/${alertId}/chart/${timeframe}`,
  );
  return response.data.map(normalizeChartRow);
}

export function useGetAlertsPaginated({
  timeframe,
  limit = 50,
  type,
  assetId,
}: Omit<GetAlertsParams, "offset">) {
  return useInfiniteQuery({
    queryKey: ["alerts/explorer/paginated", timeframe, limit, type, assetId],
    queryFn: ({ pageParam = 0 }) =>
      getAlertsPaginated({ timeframe, limit, offset: pageParam, type, assetId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
      return nextOffset < lastPage.meta.total ? nextOffset : undefined;
    },
  });
}

export function useGetAlertChart(
  alertId: string | undefined,
  timeframe: AlertTimeframe,
) {
  return useQuery({
    enabled: Boolean(alertId),
    queryKey: ["alerts/explorer/chart", alertId, timeframe],
    queryFn: () => getAlertChart(alertId as string, timeframe),
  });
}
