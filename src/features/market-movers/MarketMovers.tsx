import { useGetChartBySymbol } from "@/hooks/chart/useGetChart";
import { IndexChart } from "../chart/IndexChart";

interface MarketMoverCardProps {
  symbol: string;
  displayName: string;
}

function MarketMoverCard({ symbol, displayName }: MarketMoverCardProps) {
  const { data, isLoading } = useGetChartBySymbol(symbol, "1h", 100);

  // Calculate price change percentage (24h equivalent)
  // const priceChange =
  //   data?.ohlcData && data.ohlcData.length > 0
  //     ? ((data.ohlcData[data.ohlcData.length - 1].close -
  //         data.ohlcData[0].open) /
  //         data.ohlcData[0].open) *
  //       100
  //     : 0;

  const currentPrice =
    data?.ohlcData && data.ohlcData.length > 0
      ? data.ohlcData[data.ohlcData.length - 1].close
      : 0;

  if (isLoading) {
    return (
      <div className="flex-1 bg-black rounded-lg p-5">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-3" />
          <div className="h-7 bg-muted rounded w-32 mb-3" />
          <div className="h-3 bg-muted rounded w-16 mb-4" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black rounded-lg p-5">
      <div className="h-48 max-w-[350px] mx-auto mt-2 bg-black">
        {data?.ohlcData && data.ohlcData.length > 0 ? (
          <div className="bg-black h-full w-full">
            <IndexChart
              symbol={data.asset.symbol}
              klines={data.ohlcData}
              upColor="#5dc887"
              downColor="#e35561"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
            No data
          </div>
        )}
      </div>
    </div>
  );
}

export function MarketMovers() {
  const movers = [
    { symbol: "BTCUSDT", displayName: "Bitcoin" },
    { symbol: "ETHUSDT", displayName: "Ethereum" },
    { symbol: "SOLUSDT", displayName: "Solana" },
  ];

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {movers.map((mover) => (
          <div className="relative">
            <MarketMoverCard
              key={mover.symbol}
              symbol={mover.symbol}
              displayName={mover.displayName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
