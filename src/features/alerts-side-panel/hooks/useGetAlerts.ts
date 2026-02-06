import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Alert } from "@/types/ohlcv";

async function getAlerts(): Promise<Alert[]> {
  const response = await axios.get(`${API_URL}/alerts`);
  return response.data;
}

export function useGetAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(),
  });
}
