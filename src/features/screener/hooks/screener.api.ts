import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ScreenerAssetWithChart } from "../types";

export type ChartTimeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

export const SortBy = {
  PRICE: "price",
  ONE_MIN_PERFORMANCE: "1m_performance",
  FIVE_MIN_PERFORMANCE: "5m_performance",
  FIFTEEN_MIN_PERFORMANCE: "15m_performance",
  ONE_HOUR_PERFORMANCE: "1h_performance",
  FOUR_HOUR_PERFORMANCE: "4h_performance",
  ONE_DAY_PERFORMANCE: "1d_performance",
  ONE_MIN_VOLUME_DELTA: "1m_volume_delta",
  FIVE_MIN_VOLUME_DELTA: "5m_volume_delta",
  FIFTEEN_MIN_VOLUME_DELTA: "15m_volume_delta",
  ONE_HOUR_VOLUME_DELTA: "1h_volume_delta",
  FOUR_HOUR_VOLUME_DELTA: "4h_volume_delta",
  ONE_DAY_VOLUME_DELTA: "1d_volume_delta",
} as const;

export type SortBy = (typeof SortBy)[keyof typeof SortBy];

async function getAssets(
  sortBy: SortBy = SortBy.PRICE,
  direction: "asc" | "desc" = "asc",
  chartTimeframe: ChartTimeframe = "15m",
  assetName?: string,
) {
  const params = new URLSearchParams();
  params.set("sortBy", sortBy);
  params.set("direction", direction);
  params.set("chartTimeframe", chartTimeframe);
  if (assetName?.trim()) {
    params.set("assetName", assetName.trim());
  }
  const response = await axios.get<ScreenerAssetWithChart[]>(
    `${API_URL}/screener/top-assets?${params.toString()}`,
  );
  return response.data;
}
/**
 * Gets top assets in the screener based on defined fields
 */
type Params = {
  sortBy?: SortBy;
  direction?: "asc" | "desc";
  chartTimeframe?: ChartTimeframe;
  assetName?: string;
  refetchIntervalMs?: number | false;
};
export const useGetAssets = ({
  sortBy,
  direction,
  chartTimeframe,
  assetName,
  refetchIntervalMs = false,
}: Params) => {
  return useQuery({
    queryKey: ["top-assets", sortBy, direction, chartTimeframe, assetName],
    queryFn: () =>
      getAssets(
        sortBy ?? SortBy.PRICE,
        direction ?? "asc",
        chartTimeframe ?? "15m",
        assetName,
      ),
    refetchInterval: refetchIntervalMs,
  });
};
