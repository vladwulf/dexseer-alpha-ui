import { API_URL } from "@/config";
import type { AlertWithWindow } from "@/types/ohlcv";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function getTopAlertsWithWindow(limit: number = 100) {
  return axios.get<AlertWithWindow[]>(`${API_URL}/alerts?limit=${limit}`);
}

export const useGetTopAlertsWithWindow = (limit: number = 100) => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => getTopAlertsWithWindow(limit),
  });
};
