import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  AnalyticsBreakoutHoursResponse,
  AnalyticsBtcCorrelationResponse,
  AnalyticsHourlyMoversResponse,
  AnalyticsHourlyVolumeActivityResponse,
  AnalyticsVolumeMetric,
} from "../types";

async function getHourlyVolumeActivity(metric: AnalyticsVolumeMetric, assetLimit: number, lookbackDays: number) {
  const params = new URLSearchParams({ metric, assetLimit: String(assetLimit), lookbackDays: String(lookbackDays) });
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

export const useGetHourlyVolumeActivity = ({ metric, assetLimit = 25, lookbackDays = 14 }: Params) => {
  return useQuery({
    queryKey: ["analytics-hourly-volume", metric, assetLimit, lookbackDays],
    queryFn: () => getHourlyVolumeActivity(metric, assetLimit, lookbackDays),
  });
};

export const useGetHourlyMovers = ({ threshold = 2, lookbackDays = 14 }: { threshold?: number; lookbackDays?: number } = {}) => {
  return useQuery({
    queryKey: ["analytics-hourly-movers", threshold, lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams({ threshold: String(threshold), lookbackDays: String(lookbackDays) });
      const response = await axios.get<AnalyticsHourlyMoversResponse>(
        `${API_URL}/analytics/hourly-movers?${params.toString()}`,
      );
      return response.data;
    },
  });
};

export const useGetBtcCorrelation = ({ lookbackDays = 7 }: { lookbackDays?: number } = {}) => {
  return useQuery({
    queryKey: ["analytics-btc-correlation", lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams({ lookbackDays: String(lookbackDays) });
      const response = await axios.get<AnalyticsBtcCorrelationResponse>(
        `${API_URL}/analytics/btc-correlation?${params.toString()}`,
      );
      return response.data;
    },
  });
};

export const useGetBreakoutHours = ({ lookbackDays = 30 }: { lookbackDays?: number } = {}) => {
  return useQuery({
    queryKey: ["analytics-breakout-hours", lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams({ lookbackDays: String(lookbackDays) });
      const response = await axios.get<AnalyticsBreakoutHoursResponse>(
        `${API_URL}/analytics/breakout-hours?${params.toString()}`,
      );
      return response.data;
    },
  });
};
