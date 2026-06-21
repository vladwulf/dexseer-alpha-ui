import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";

const FRONTEND_API_BASE = `${API_URL}/api/frontend/v1`;

const SOCKET_PRIMED_QUERY_OPTIONS = {
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

const NO_FRONTEND_CACHE_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const;

export type StatsQuote = "USDT";
export type RunnerBoard = "gainers" | "losers" | "volume";
export type RunnerTimeframe = "1h" | "4h" | "1d";
export type ScannerPresetKey =
  | "gainers"
  | "momentum"
  | "losers"
  | "breakouts"
  | "pullbacks"
  | "oi_expansion"
  | "funding_extremes"
  | "squeeze_candidates"
  | "btc_decouplers"
  | "high_rvol";
export type ScannerChartTimeframe =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d";
export type ScannerListTimeframe = ScannerChartTimeframe;
export type ScannerSortBy =
  | "price"
  | "change_pct"
  | "change_5m"
  | "change_15m"
  | "change_1h"
  | "change_4h"
  | "change_24h"
  | "volume_24h"
  | "rvol_24h"
  | "oi_change_24h"
  | "funding_rate"
  | "alert_count"
  | "score";
export type ScannerSortDirection = "asc" | "desc";

export type MarketStripRequest = {
  symbols?: string;
  quote?: StatsQuote;
};

export type MarketStripResponse = {
  updated_at: string | null;
  breadth: {
    gainers: number;
    losers: number;
    unchanged: number;
    ratio: string;
  };
  items: {
    asset_id: number;
    symbol: string;
    price: number | null;
    change_15m: number | null;
    change_1h: number | null;
    change_24h: number | null;
  }[];
};

export type RunnersRequest = {
  board?: RunnerBoard;
  timeframes?: string;
  limit?: number;
};

export type RunnerEntry = {
  asset_id: number;
  symbol: string;
  price: number | null;
  change_pct: number;
  volume: number | null;
  rank: number;
};

export type RunnerMetricData = {
  timeframe: RunnerTimeframe;
  limit: number;
  entries: RunnerEntry[];
};

export type RunnersResponse = {
  updated_at: string | null;
  boards: Partial<
    Record<RunnerBoard, Partial<Record<RunnerTimeframe, RunnerMetricData>>>
  >;
};

export type ScannerRequest = {
  preset?: ScannerPresetKey;
  search?: string;
  limit?: number;
  offset?: number;
  min_volume_24h?: number;
  min_rvol_24h?: number;
  min_oi_change_24h?: number;
  min_funding_rate?: number;
  max_funding_rate?: number;
  sort_by?: ScannerSortBy;
  sort_direction?: ScannerSortDirection;
};

export type ScannerRow = {
  asset_id: number;
  symbol: string;
  market: "PERP";
  price: number | null;
  change_5m: number | null;
  change_15m: number | null;
  change_1h: number | null;
  change_4h: number | null;
  change_24h: number | null;
  volume_24h: number | null;
  rvol_24h: number | null;
  oi_change_24h: number | null;
  funding_rate: number | null;
  alert_count: number | null;
  score: number | null;
};

export type ScannerResponse = {
  preset: ScannerPresetKey | null;
  timeframe?: ScannerListTimeframe;
  sort_by: string;
  sort_direction: ScannerSortDirection;
  limit: number;
  offset: number;
  total: number;
  updated_at: string | null;
  entries: ScannerRow[];
};

export type ScannerChartRequest = {
  timeframe?: ScannerChartTimeframe;
  limit?: number;
};

export type ScannerCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume_base: number | null;
  volume_quote: number | null;
};

export type ScannerBatchChartsRequest = {
  asset_ids: string;
  timeframe?: ScannerChartTimeframe;
  limit?: number;
};

export type ScannerBatchChartAsset =
  | {
      asset_id: number;
      symbol: string;
      status: "ok";
      updated_at: string | null;
      candles: ScannerCandle[];
    }
  | {
      asset_id: number;
      symbol: null;
      status: "not_found";
      updated_at: null;
      candles: [];
      error: "Asset not found";
    };

export type ScannerBatchChartsResponse = {
  timeframe: ScannerChartTimeframe;
  limit: number;
  updated_at: string | null;
  assets: ScannerBatchChartAsset[];
};

export type ScannerChartResponse = {
  asset_id: number;
  symbol: string;
  timeframe: ScannerChartTimeframe;
  updated_at: string | null;
  candles: ScannerCandle[];
};

export type ScannerAssetDetailsResponse = {
  asset_id: number;
  symbol: string;
  market: "PERP";
  price: number | null;
  stats: {
    change_15m: number | null;
    change_1h: number | null;
    change_4h: number | null;
    change_24h: number | null;
    volume_24h: number | null;
    rvol_24h: number | null;
    oi_change_24h: number | null;
    funding_rate: number | null;
    atr_percent_24h: number | null;
    btc_correlation_1h: number | null;
  };
  setup: null;
  recent_alerts: [];
  session_edge: null;
  updated_at: string | null;
};

export type ScannerDetailsChartRequest = {
  timeframe?: ScannerChartTimeframe;
  from?: string;
  to?: string;
  overlays?: string;
};

export type ScannerDetailsChartResponse = {
  asset_id: number;
  symbol: string;
  timeframe: ScannerChartTimeframe;
  candles: ScannerCandle[];
  overlays: {
    oi?: [];
    funding?: [];
    alerts?: [];
  };
  updated_at: string | null;
};

type ScannerQueryOptions = {
  refetchIntervalMs?: number | false;
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
}

async function getMarketStrip(params: MarketStripRequest = {}) {
  const response = await axios.get<MarketStripResponse>(
    `${FRONTEND_API_BASE}/stats/market-strip${buildQueryString(params)}`,
  );
  return response.data;
}

async function getRunners(params: RunnersRequest = {}) {
  const response = await axios.get<RunnersResponse>(
    `${FRONTEND_API_BASE}/stats/runners${buildQueryString(params)}`,
  );
  return response.data;
}

async function getScanner(params: ScannerRequest = {}) {
  const response = await axios.get<ScannerResponse>(
    `${FRONTEND_API_BASE}/scanner${buildQueryString(params)}`,
  );
  return response.data;
}

async function getScannerChart(
  assetId: number,
  params: ScannerChartRequest = {},
) {
  const response = await axios.get<ScannerChartResponse>(
    `${FRONTEND_API_BASE}/scanner/assets/${assetId}/chart${buildQueryString(
      params,
    )}`,
  );
  return response.data;
}

async function getScannerCharts(params: ScannerBatchChartsRequest) {
  const response = await axios.get<ScannerBatchChartsResponse>(
    `${FRONTEND_API_BASE}/scanner/charts${buildQueryString(params)}`,
  );
  return response.data;
}

async function getScannerAssetDetails(assetId: number) {
  const response = await axios.get<ScannerAssetDetailsResponse>(
    `${FRONTEND_API_BASE}/scanner/assets/${assetId}/details`,
  );
  return response.data;
}

async function getScannerAssetDetailsChart(
  assetId: number,
  params: ScannerDetailsChartRequest = {},
) {
  const response = await axios.get<ScannerDetailsChartResponse>(
    `${FRONTEND_API_BASE}/scanner/assets/${assetId}/details/chart${buildQueryString(
      params,
    )}`,
  );
  return response.data;
}

export function useGetMarketStrip(params: MarketStripRequest = {}) {
  return useQuery({
    queryKey: ["scanner-v2-market-strip", params],
    queryFn: () => getMarketStrip(params),
    ...SOCKET_PRIMED_QUERY_OPTIONS,
  });
}

export function useGetStatsRunners(params: RunnersRequest = {}) {
  return useQuery({
    queryKey: ["scanner-v2-runners", params],
    queryFn: () => getRunners(params),
    ...SOCKET_PRIMED_QUERY_OPTIONS,
  });
}

export function useGetScanner(
  params: ScannerRequest = {},
  options: ScannerQueryOptions = {},
) {
  const { refetchIntervalMs = 3000 } = options;

  return useQuery({
    queryKey: ["scanner-v2-list", params],
    queryFn: () => getScanner(params),
    refetchInterval: refetchIntervalMs,
    ...NO_FRONTEND_CACHE_QUERY_OPTIONS,
  });
}

export function useGetScannerChart(
  assetId: number | null | undefined,
  params: ScannerChartRequest = {},
) {
  return useQuery({
    queryKey: ["scanner-v2-chart", assetId, params],
    queryFn: () => getScannerChart(assetId ?? 0, params),
    enabled: assetId !== null && assetId !== undefined,
    ...SOCKET_PRIMED_QUERY_OPTIONS,
  });
}

export function useGetScannerCharts(
  params: ScannerBatchChartsRequest | null,
  options: ScannerQueryOptions = {},
) {
  const { refetchIntervalMs = 3000 } = options;

  return useQuery({
    queryKey: ["scanner-v2-charts", params],
    queryFn: () => getScannerCharts(params as ScannerBatchChartsRequest),
    enabled: params !== null,
    refetchInterval: refetchIntervalMs,
    ...NO_FRONTEND_CACHE_QUERY_OPTIONS,
  });
}

export function useGetScannerAssetDetails(assetId: number | null | undefined) {
  return useQuery({
    queryKey: ["scanner-v2-asset-details", assetId],
    queryFn: () => getScannerAssetDetails(assetId ?? 0),
    enabled: assetId !== null && assetId !== undefined,
    ...SOCKET_PRIMED_QUERY_OPTIONS,
  });
}

export function useGetScannerAssetDetailsChart(
  assetId: number | null | undefined,
  params: ScannerDetailsChartRequest = {},
  options: ScannerQueryOptions = {},
) {
  const { refetchIntervalMs = 3000 } = options;

  return useQuery({
    queryKey: ["scanner-v2-asset-details-chart", assetId, params],
    queryFn: () => getScannerAssetDetailsChart(assetId ?? 0, params),
    enabled: assetId !== null && assetId !== undefined,
    refetchInterval: refetchIntervalMs,
    ...SOCKET_PRIMED_QUERY_OPTIONS,
  });
}
