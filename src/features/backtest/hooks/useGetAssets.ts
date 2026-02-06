import { API_URL } from "@/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetAssetsResponse = {
  id: number;
  symbol: string;
};

function getAssets(query: string) {
  return axios.get<GetAssetsResponse[]>(
    `${API_URL}/charts/assets/search?query=${query}`
  );
}

export const useGetAssets = (query: string) => {
  return useQuery({
    enabled: !!query,
    queryKey: ["charts", query],
    queryFn: () => getAssets(query),
  });
};
