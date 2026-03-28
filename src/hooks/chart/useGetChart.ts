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
    `${API_URL}/chart/asset/${assetId}/timeframe/${timeframe}`,
  );
  return response.data;
}

type AssetLookupResponse = Array<{
  id: number;
  symbol: string;
}>;

async function getAssetIdBySymbol(symbol: string) {
  const params = new URLSearchParams();
  params.set("sortBy", "price");
  params.set("direction", "desc");
  params.set("chartTimeframe", "1m");
  params.set("assetName", symbol);

  const response = await axios.get<AssetLookupResponse>(
    `${API_URL}/screener/top-assets?${params.toString()}`,
  );

  const exactMatch = response.data.find(
    (asset) => asset.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (exactMatch) {
    return exactMatch.id;
  }

  const firstMatch = response.data[0];
  if (!firstMatch) {
    throw new Error(`No asset found for symbol: ${symbol}`);
  }

  return firstMatch.id;
}

async function getChartBySymbol(
  symbol: string,
  timeframe: string,
  limit: number,
) {
  const assetId = await getAssetIdBySymbol(symbol);
  const chart = await getChart(assetId, timeframe);

  if (limit > 0 && chart.ohlcData.length > limit) {
    return {
      ...chart,
      ohlcData: chart.ohlcData.slice(-limit),
    };
  }

  return chart;
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
