import { StandardChart } from "@/features/chart/StandardChart";
import { useGetChartBySymbol } from "@/hooks/chart/useGetChart";
import { useSearchParams } from "react-router";

export default function ChartPage() {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get("symbol");
  const timeframe = searchParams.get("timeframe");

  const { data } = useGetChartBySymbol(symbol ?? "", timeframe ?? "1m");

  console.log("data", data);
  return (
    <div>
      <div className="container mx-auto h-[800px] w-[1200px]">
        <h2 className="text-2xl font-bold mb-4">{data?.asset.symbol}</h2>
        <StandardChart
          klines={data?.ohlcData ?? []}
          // width="1000px"
          // height="600px"
        />
      </div>
    </div>
  );
}
