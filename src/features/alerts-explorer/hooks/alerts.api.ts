import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL } from "@/config";
import type { OHLCVExtended } from "@/types/ohlcv";

export type AlertTimeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

export type AlertDirection = string;
export type AlertType = string;
export type AlertEventType = string;
export type AlertSortBy = "triggered_at" | "alert_type";
export type SortOrder = "asc" | "desc";

export type AlertTypeTotal = {
  alert_type: AlertEventType;
  total: number;
};

export type AlertListItem = {
  id: string;
  created_at: string;
  time: string;
  triggered_at?: string;
  timeframe: AlertTimeframe;
  strategy_id: string;
  strategy_version: number;
  direction: AlertDirection;
  type: AlertType;
  alert_type?: AlertEventType;
  momentum_label?: string;
  price: number;
  instrument: {
    venue: string;
    market_type: string;
    instrument_id: string;
    instrument_symbol: string;
    base_asset_id: string;
    base_asset_symbol: string;
    quote_asset_id: string;
    quote_asset_symbol: string;
    source: string;
  };
  trigger_values: Record<string, unknown>;
  thresholds: Record<string, unknown>;
};

type LiveAlertPayload = Omit<
  Partial<AlertListItem>,
  "instrument" | "trigger_values"
> & {
  id: string;
  instrument: AlertListItem["instrument"];
  strategyId?: string;
  strategy_id?: string;
  strategyVersion?: number;
  strategy_version?: number;
  timeMs?: number;
  triggeredAtMs?: number;
  triggered_at?: string;
  triggerValues?: Record<string, unknown>;
  trigger_values?: Record<string, unknown>;
};

function timestampFromMilliseconds(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value).toISOString()
    : undefined;
}

function normalizeLiveAlert(payload: LiveAlertPayload): AlertListItem {
  const triggeredAt =
    payload.triggered_at ?? timestampFromMilliseconds(payload.triggeredAtMs);
  const time = payload.time ?? timestampFromMilliseconds(payload.timeMs);

  return {
    ...payload,
    created_at: payload.created_at ?? new Date().toISOString(),
    time: time ?? triggeredAt ?? new Date().toISOString(),
    triggered_at: triggeredAt,
    timeframe: payload.timeframe ?? "5m",
    strategy_id: payload.strategy_id ?? payload.strategyId ?? "",
    strategy_version: payload.strategy_version ?? payload.strategyVersion ?? 1,
    direction: payload.direction ?? "",
    type: payload.type ?? "",
    price: payload.price ?? 0,
    trigger_values: payload.trigger_values ?? payload.triggerValues ?? {},
    thresholds: payload.thresholds ?? {},
    instrument: payload.instrument,
  };
}

export type AlertsResponse = {
  data: AlertListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type AlertChartRow = {
  asset_id?: number | string | null;
  instrument_id: string;
  time: string;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
  asset_volume: number | string;
  quote_volume: number | string;
  rel_vol_1p?: number | string | null;
  rel_vol_16p?: number | string | null;
  rel_vol_96p?: number | string | null;
  is_16p_break_up?: boolean | number | string | null;
  is_16p_break_down?: boolean | number | string | null;
  is_96p_break_up?: boolean | number | string | null;
  is_96p_break_down?: boolean | number | string | null;
  is_16p_breakout?: boolean | number | string | null;
  is_16p_breakdown?: boolean | number | string | null;
  is_96p_breakout?: boolean | number | string | null;
  is_96p_breakdown?: boolean | number | string | null;
  ema9?: number | string | null;
  ema20?: number | string | null;
  ema50?: number | string | null;
  ema100?: number | string | null;
  ema200?: number | string | null;
  macd_signal?: number | string | null;
  macd_line?: number | string | null;
  macd_histogram?: number | string | null;
  macd_signal_slope?: number | string | null;
  atr14?: number | string | null;
  choppiness_index_14?: number | string | null;
  adx14?: number | string | null;
  range_z?: number | string | null;
  rvol_z_sustained?: number | string | null;
  move_z?: number | string | null;
  [key: string]: unknown;
};

export type Opportunity = {
  alert_id: string;
  instrument_symbol: string;
  direction: AlertDirection;
  timeframe: AlertTimeframe;
  price_at_alert: number;
  extreme_price: number;
  extreme_time: string;
  performance_pct: number;
};

type GetAlertsParams = {
  enabled?: boolean;
  timeframe?: AlertTimeframe;
  limit?: number;
  offset?: number;
  type?: string;
  symbol?: string;
  refetchInterval?: number;
  direction?: string;
  strategyId?: string;
  alertType?: AlertEventType;
  sortBy?: AlertSortBy;
  sortOrder?: SortOrder;
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
  instrument_id: row.instrument_id,
  time: row.time,
  open: toNumber(row.open),
  high: toNumber(row.high),
  low: toNumber(row.low),
  close: toNumber(row.close),
  analytics_updated_at: null,
  asset_volume: toNumber(row.asset_volume),
  quote_volume: toNumber(row.quote_volume),
  rel_vol_1p: toNullableNumber(row.rel_vol_1p),
  rel_vol_16p: toNullableNumber(row.rel_vol_16p),
  rel_vol_96p: toNullableNumber(row.rel_vol_96p),
  is_16p_breakout: toBoolean(row.is_16p_breakout ?? row.is_16p_break_up),
  is_16p_breakdown: toBoolean(row.is_16p_breakdown ?? row.is_16p_break_down),
  is_96p_breakout: toBoolean(row.is_96p_breakout ?? row.is_96p_break_up),
  is_96p_breakdown: toBoolean(row.is_96p_breakdown ?? row.is_96p_break_down),
  ema9: toNullableNumber(row.ema9),
  ema20: toNullableNumber(row.ema20),
  ema50: toNullableNumber(row.ema50),
  ema100: toNullableNumber(row.ema100),
  ema200: toNullableNumber(row.ema200),
  macd_signal: toNullableNumber(row.macd_signal),
  macd_line: toNullableNumber(row.macd_line),
  macd_histogram: toNullableNumber(row.macd_histogram),
  macd_signal_slope: toNullableNumber(row.macd_signal_slope),
  atr14: toNullableNumber(row.atr14),
  choppiness_index_14: toNullableNumber(row.choppiness_index_14),
  adx14: toNullableNumber(row.adx14),
  range_z: toNullableNumber(row.range_z),
  rvol_z_sustained: toNullableNumber(row.rvol_z_sustained),
  move_z: toNullableNumber(row.move_z),
});

async function getAlertsPaginated({
  timeframe,
  limit = 50,
  offset = 0,
  type,
  symbol,
  direction,
  strategyId,
  alertType,
  sortBy = "triggered_at",
  sortOrder = "desc",
}: GetAlertsParams) {
  const response = await axios.get<AlertsResponse>(`${API_URL}/alerts`, {
    params: {
      timeframe: timeframe || undefined,
      limit,
      offset,
      type: type || undefined,
      symbol,
      direction: direction || undefined,
      strategyId: strategyId || undefined,
      alertType: alertType || undefined,
      sortBy,
      sortOrder,
    },
  });
  return response.data;
}

async function getAlertTypes() {
  const response = await axios.get<AlertTypeTotal[]>(`${API_URL}/alerts/types`);
  return response.data;
}

export function useGetAlertTypes(refetchInterval?: number) {
  return useQuery({
    refetchInterval,
    queryKey: ["alerts/explorer/types"],
    queryFn: getAlertTypes,
  });
}

async function getAlertChart(alertId: string, timeframe: AlertTimeframe) {
  const response = await axios.get<AlertChartRow[]>(
    `${API_URL}/alerts/${alertId}/chart/${timeframe}`,
  );
  return response.data.map(normalizeChartRow);
}

async function getOpportunities(limit: number) {
  const response = await axios.get<Opportunity[] | { data: Opportunity[] }>(
    `${API_URL}/alerts/opportunities`,
    { params: { limit } },
  );
  return Array.isArray(response.data) ? response.data : response.data.data;
}

export function useGetOpportunities(limit = 20) {
  return useQuery({
    queryKey: ["alerts/opportunities", limit],
    queryFn: () => getOpportunities(limit),
  });
}

export function useGetAlertsPaginated({
  timeframe,
  limit = 50,
  type,
  symbol,
  refetchInterval,
  direction,
  strategyId,
  alertType,
  sortBy = "triggered_at",
  sortOrder = "desc",
}: Omit<GetAlertsParams, "offset">) {
  return useInfiniteQuery({
    refetchInterval,
    queryKey: [
      "alerts/explorer/paginated",
      timeframe,
      limit,
      type,
      symbol,
      direction,
      strategyId,
      alertType,
      sortBy,
      sortOrder,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getAlertsPaginated({
        timeframe,
        limit,
        offset: pageParam,
        type,
        symbol,
        direction,
        strategyId,
        alertType,
        sortBy,
        sortOrder,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
      return nextOffset < lastPage.meta.total ? nextOffset : undefined;
    },
  });
}

export function useGetAlertsPage({
  enabled = true,
  timeframe,
  limit = 50,
  offset = 0,
  type,
  symbol,
  refetchInterval,
  direction,
  strategyId,
  alertType,
  sortBy = "triggered_at",
  sortOrder = "desc",
}: GetAlertsParams) {
  return useQuery({
    enabled,
    refetchInterval,
    queryKey: [
      "alerts/explorer/page",
      timeframe,
      limit,
      offset,
      type,
      symbol,
      direction,
      strategyId,
      alertType,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getAlertsPaginated({
        timeframe,
        limit,
        offset,
        type,
        symbol,
        direction,
        strategyId,
        alertType,
        sortBy,
        sortOrder,
      }),
  });
}

/** Momentum Intelligence reports state transitions, including provisional intrabar events. */
export const MOMENTUM_INTELLIGENCE_STRATEGY_IDS = [
  "momentum-intelligence-5m-v2",
  "momentum-intelligence-15m-v2",
  "momentum-intelligence-1h-v2",
] as const;

type UseLiveMomentumIntelligenceAlertsOptions = {
  onAlertCreated?: (alert: AlertListItem) => void;
};

export function useLiveMomentumIntelligenceAlerts({
  onAlertCreated,
}: UseLiveMomentumIntelligenceAlertsOptions = {}) {
  const queryClient = useQueryClient();
  const onAlertCreatedRef = useRef(onAlertCreated);

  useEffect(() => {
    onAlertCreatedRef.current = onAlertCreated;
  }, [onAlertCreated]);

  useEffect(() => {
    if (!API_URL) return;

    const socket = io(new URL("/ws", API_URL).toString(), {
      transports: ["websocket"],
    });
    const refetchDurableAlerts = () => {
      void queryClient.invalidateQueries({
        queryKey: ["alerts/explorer/paginated"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["alerts/explorer/page"],
      });
    };
    const handleAlertCreated = (payload: LiveAlertPayload) => {
      const strategyId =
        payload.strategy_id ??
        payload.strategyId ??
        (typeof payload.type === "string"
          ? payload.type.split(":", 1)[0]
          : undefined);
      const strategyVersion =
        payload.strategy_version ?? payload.strategyVersion;
      const isUnsupportedMomentumAlert =
        !MOMENTUM_INTELLIGENCE_STRATEGY_IDS.includes(strategyId as never) ||
        (strategyVersion != null && Number(strategyVersion) !== 2);
      const alert = normalizeLiveAlert({ ...payload, strategy_id: strategyId });
      if (!isUnsupportedMomentumAlert) {
        onAlertCreatedRef.current?.(alert);
      }
      const alertEventType =
        alert.alert_type ??
        (typeof alert.trigger_values.event_type === "string"
          ? alert.trigger_values.event_type
          : undefined);

      for (const query of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["alerts/explorer/paginated"] })) {
        const key = query.queryKey;
        if (!Array.isArray(key)) continue;
        const strategyId = key[6];
        const symbol = key[4];
        const direction = key[5];
        const alertType = key[7];
        if (
          (typeof strategyId === "string" &&
            alert.strategy_id &&
            strategyId !== alert.strategy_id) ||
          (typeof symbol === "string" &&
            symbol.toLowerCase() !==
              alert.instrument.instrument_symbol.toLowerCase()) ||
          (typeof direction === "string" &&
            direction.toLowerCase() !== alert.direction.toLowerCase()) ||
          (typeof alertType === "string" && alertType !== alertEventType)
        ) {
          continue;
        }

        queryClient.setQueryData<InfiniteData<AlertsResponse, number>>(
          key,
          (current) => {
            if (
              !current ||
              current.pages.some((page) =>
                page.data.some((item) => item.id === alert.id),
              )
            )
              return current;
            const firstPage = current.pages[0];
            if (!firstPage) return current;
            return {
              ...current,
              pages: [
                {
                  ...firstPage,
                  data: [alert, ...firstPage.data],
                  meta: { ...firstPage.meta, total: firstPage.meta.total + 1 },
                },
                ...current.pages.slice(1),
              ],
            };
          },
        );
      }

      for (const query of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["alerts/explorer/page"] })) {
        const key = query.queryKey;
        if (!Array.isArray(key)) continue;
        const offset = key[3];
        const symbol = key[5];
        const direction = key[6];
        const strategyId = key[7];
        const alertType = key[8];
        if (
          (typeof strategyId === "string" &&
            alert.strategy_id &&
            strategyId !== alert.strategy_id) ||
          (typeof symbol === "string" &&
            symbol.toLowerCase() !==
              alert.instrument.instrument_symbol.toLowerCase()) ||
          (typeof direction === "string" &&
            direction.toLowerCase() !== alert.direction.toLowerCase()) ||
          (typeof alertType === "string" && alertType !== alertEventType)
        ) {
          continue;
        }

        queryClient.setQueryData<AlertsResponse>(key, (current) => {
          if (!current || current.data.some((item) => item.id === alert.id)) {
            return current;
          }
          const limit =
            typeof key[2] === "number" ? key[2] : current.meta.limit;
          return {
            ...current,
            data:
              offset === 0
                ? [alert, ...current.data].slice(0, limit)
                : current.data,
            meta: { ...current.meta, total: current.meta.total + 1 },
          };
        });
      }
    };

    socket.on("alert.created", handleAlertCreated);
    socket.on("connect", () => {
      socket.emit("subscribe", "alerts");
      // The room acknowledgement has no snapshot, so reload durable alerts on
      // every connection to recover any events missed while disconnected.
      refetchDurableAlerts();
    });
    if (socket.connected) {
      socket.emit("subscribe", "alerts");
      refetchDurableAlerts();
    }
    return () => {
      socket.off("alert.created", handleAlertCreated);
      socket.emit("unsubscribe", "alerts");
      socket.disconnect();
    };
  }, [queryClient]);
}

export function useGetAlertChart(
  alertId: string | undefined,
  timeframe: AlertTimeframe,
  enabled = true,
) {
  return useQuery({
    enabled: Boolean(alertId) && enabled,
    queryKey: ["alerts/explorer/chart", alertId, timeframe],
    queryFn: () => getAlertChart(alertId as string, timeframe),
  });
}
