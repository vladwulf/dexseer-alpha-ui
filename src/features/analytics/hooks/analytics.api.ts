import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config";
import type {
  AnalyticsBreakoutHoursResponse,
  AnalyticsBtcCorrelationResponse,
  AnalyticsDistributionMetric,
  AnalyticsDistributionResponse,
  AnalyticsHourlyVolumeActivityResponse,
  AnalyticsMoversTimeframe,
  AnalyticsTimeframeMoversResponse,
  AnalyticsVolumeMetric,
  ReplayFrame,
  RunnerBoard,
  RunnerMetric,
  RunnersResponse,
} from "../types";

async function getHourlyVolumeActivity(
  metric: AnalyticsVolumeMetric,
  assetLimit: number,
  lookbackDays: number,
) {
  const params = new URLSearchParams({
    metric,
    assetLimit: String(assetLimit),
    lookbackDays: String(lookbackDays),
  });
  const response = await axios.get<AnalyticsHourlyVolumeActivityResponse>(
    `${API_URL}/analytics/hourly-volume-activity?${params.toString()}`,
  );
  return response.data;
}

type Params = {
  metric: AnalyticsVolumeMetric;
  assetLimit?: number;
  lookbackDays?: number;
};

export const useGetHourlyVolumeActivity = ({
  metric,
  assetLimit = 25,
  lookbackDays = 14,
}: Params) => {
  return useQuery({
    queryKey: ["analytics-hourly-volume", metric, assetLimit, lookbackDays],
    queryFn: () => getHourlyVolumeActivity(metric, assetLimit, lookbackDays),
  });
};

export const useGetTimeframeMovers = ({
  threshold = 2,
  lookbackDays = 14,
  timeframe = "1h",
}: {
  threshold?: number;
  lookbackDays?: number;
  timeframe?: AnalyticsMoversTimeframe;
} = {}) => {
  return useQuery({
    queryKey: [
      "analytics-timeframe-movers",
      threshold,
      lookbackDays,
      timeframe,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        threshold: String(threshold),
        lookbackDays: String(lookbackDays),
        timeframe,
      });
      const response = await axios.get<AnalyticsTimeframeMoversResponse>(
        `${API_URL}/analytics/movers-by-timeframe?${params.toString()}`,
      );
      return response.data;
    },
  });
};

export const useGetBtcCorrelation = ({
  lookbackDays = 7,
}: {
  lookbackDays?: number;
} = {}) => {
  return useQuery({
    queryKey: ["analytics-btc-correlation", lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams({
        lookbackDays: String(lookbackDays),
      });
      const response = await axios.get<AnalyticsBtcCorrelationResponse>(
        `${API_URL}/analytics/btc-correlation?${params.toString()}`,
      );
      return response.data;
    },
  });
};

export const useGetBreakoutHours = ({
  lookbackDays = 30,
}: {
  lookbackDays?: number;
} = {}) => {
  return useQuery({
    queryKey: ["analytics-breakout-hours", lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams({
        lookbackDays: String(lookbackDays),
      });
      const response = await axios.get<AnalyticsBreakoutHoursResponse>(
        `${API_URL}/analytics/breakout-hours?${params.toString()}`,
      );
      return response.data;
    },
  });
};

export const useGetPriceChangeDistribution = (
  metric: AnalyticsDistributionMetric,
) => {
  return useQuery({
    queryKey: ["screener-price-change-distribution", metric],
    queryFn: async () => {
      const response = await axios.get<AnalyticsDistributionResponse>(
        `${API_URL}/screener/distribution/price-change?metric=${metric}`,
      );
      return response.data;
    },
    refetchInterval: 10000,
  });
};

function getRunnersBasePath(board: RunnerBoard) {
  if (board === "short") return "short";
  if (board === "volume") return "volume";
  return "";
}

export const useGetRunners = (board: RunnerBoard) => {
  return useQuery({
    queryKey: ["screener-runners", board],
    queryFn: async () => {
      const suffix = getRunnersBasePath(board);
      const response = await axios.get<RunnersResponse>(
        `${API_URL}/screener/runners${suffix ? `/${suffix}` : ""}`,
      );
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useGetRunnersReplay = (
  board: RunnerBoard,
  metric: RunnerMetric,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["screener-runners-replay", board, metric],
    queryFn: async () => {
      const suffix = getRunnersBasePath(board);
      const response = await axios.get<ReplayFrame[]>(
        `${API_URL}/screener/runners${suffix ? `/${suffix}` : ""}/replay?metric=${metric}`,
      );
      return response.data;
    },
    enabled,
  });
};
