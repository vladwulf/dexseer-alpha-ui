import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";
import type { ScreenerAssetWithChart } from "../types";

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
  direction: "asc" | "desc" = "asc"
) {
  const response = await axios.get<ScreenerAssetWithChart[]>(
    `${API_URL}/screener/top-assets?sortBy=${sortBy}&direction=${direction}`
  );
  return response.data;
}
/**
 * Gets top assets in the screener based on defined fields
 */
type Params = {
  sortBy?: SortBy;
  direction?: "asc" | "desc";
};
export const useGetAssets = ({ sortBy, direction }: Params) => {
  return useQuery({
    queryKey: ["top-assets", sortBy, direction],
    queryFn: () => getAssets(sortBy ?? SortBy.PRICE, direction ?? "asc"),
    refetchInterval: 5000,
  });
};
