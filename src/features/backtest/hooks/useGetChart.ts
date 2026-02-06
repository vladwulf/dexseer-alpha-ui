import { API_URL } from "@/config";
import type { Alert, OHLCVExtended } from "@/types/ohlcv";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function getChart(assetId: number, timeframe: string) {
  return axios.get<{ ohlcs: OHLCVExtended[]; alerts: Alert[] }>(
    `${API_URL}/screener/chart/asset/${assetId}/timeframe/${timeframe}`
  );
}

export const useGetChart = (assetId: number | null, timeframe: string) => {
  return useQuery({
    enabled: assetId !== null && !!timeframe,
    queryKey: ["chart", assetId ?? -1, timeframe],
    queryFn: () => getChart(assetId ?? -1, timeframe),
  });
};
