import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { Asset, OHLCVExtended } from "@/types/ohlcv";
import { API_URL } from "@/config";

type GetChartResponse = {
  asset: Asset;
  ohlcData: OHLCVExtended[];
};

async function getChart(assetId: number, timeframe: string) {
  const response = await axios.get<GetChartResponse>(
    `${API_URL}/screener/chart/asset/${assetId}/timeframe/${timeframe}`,
  );
  return response.data;
}

async function getChartBySymbol(
  symbol: string,
  timeframe: string,
  limit: number,
) {
  const response = await axios.get<GetChartResponse>(
    `${API_URL}/charts?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`,
  );
  return response.data;
}

export function useGetChart(assetId: number | null, timeframe: string | null) {
  return useQuery({
    enabled: !!assetId && !!timeframe,
    queryKey: ["chart", assetId, timeframe],
    queryFn: () => getChart(assetId ?? -1, timeframe ?? "1m"),
  });
}

export function useGetChartBySymbol(
  symbol: string,
  timeframe: string,
  limit: number = 50,
) {
  return useQuery({
    enabled: !!symbol && !!timeframe,
    queryKey: ["chart", symbol, timeframe, limit],
    queryFn: () => getChartBySymbol(symbol, timeframe, limit),
    refetchInterval: 15000,
  });
}
