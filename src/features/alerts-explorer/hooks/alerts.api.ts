import { API_URL } from "@/config";
import type { AlertType, OHLCVExtended } from "@/types/ohlcv";
import type { PaginatedResponse } from "@/types/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Alert {
  id: number;
  time: string;
  type: AlertType;
  asset: {
    id: number;
    symbol: string;
  };
}

async function getAlertsPaginated(
  timeframe: string,
  limit: number = 100,
  offset: number = 0,
) {
  const response = await axios.get<PaginatedResponse<Alert>>(
    `${API_URL}/alerts`,
    {
      params: {
        timeframe,
        limit,
        offset,
      },
    },
  );
  return response.data;
}

async function getAlertChart(alertId: number, timeframe: string) {
  const response = await axios.get<OHLCVExtended[]>(
    `${API_URL}/alerts/${alertId}/chart/${timeframe}`,
  );
  return response.data;
}

// export function useGetAlerts(
//   timeframe: string,
//   limit: number = 100,
//   offset: number = 0,
// ) {
//   return useQuery({
//     queryKey: ["alerts/explorer", limit, offset],
//     queryFn: () => getAlerts(timeframe, limit, offset),
//   });
// }

export function useGetAlertsPaginated(timeframe: string, limit: number = 100) {
  return useInfiniteQuery({
    queryKey: ["trades/explorer/paginated"],
    queryFn: ({ pageParam = 0 }) =>
      getAlertsPaginated(timeframe, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
      return nextOffset < lastPage.meta.total ? nextOffset : undefined;
    },
  });
}

export function useGetAlertChart(alertId: number, timeframe: string) {
  return useQuery({
    enabled: alertId != undefined,
    queryKey: ["alerts/explorer/chart", alertId, timeframe],
    queryFn: () => getAlertChart(alertId, timeframe),
  });
}
