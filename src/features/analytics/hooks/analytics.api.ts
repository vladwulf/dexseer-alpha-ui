import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AnalyticsHourlyVolumeActivityResponse, AnalyticsVolumeMetric } from "../types";

async function getHourlyVolumeActivity(metric: AnalyticsVolumeMetric, assetLimit: number) {
  const params = new URLSearchParams({ metric, assetLimit: String(assetLimit) });
  const response = await axios.get<AnalyticsHourlyVolumeActivityResponse>(
    `${API_URL}/analytics/hourly-volume-activity?${params.toString()}`,
  );
  return response.data;
}

type Params = {
  metric: AnalyticsVolumeMetric;
  assetLimit?: number;
};

export const useGetHourlyVolumeActivity = ({ metric, assetLimit = 25 }: Params) => {
  return useQuery({
    queryKey: ["analytics-hourly-volume", metric, assetLimit],
    queryFn: () => getHourlyVolumeActivity(metric, assetLimit),
  });
};
