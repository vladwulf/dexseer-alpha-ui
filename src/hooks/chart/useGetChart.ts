import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { Asset, OHLCVExtended } from "@/types/ohlcv";

const API_URL = import.meta.env.VITE_API_URL;

type GetChartResponse = {
  asset: Asset;
  ohlcData: OHLCVExtended[];
};

async function getChart(assetId: number, timeframe: string) {
  const response = await axios.get<GetChartResponse>(
    `${API_URL}/charts?assetId=${assetId}&timeframe=${timeframe}`
  );
  return response.data;
}

async function getChartBySymbol(symbol: string, timeframe: string) {
  const response = await axios.get<GetChartResponse>(
    `${API_URL}/charts?symbol=${symbol}&timeframe=${timeframe}`
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

export function useGetChartBySymbol(symbol: string, timeframe: string) {
  return useQuery({
    enabled: !!symbol,
    queryKey: ["chart", symbol, timeframe],
    queryFn: () => getChartBySymbol(symbol, timeframe),
  });
}
