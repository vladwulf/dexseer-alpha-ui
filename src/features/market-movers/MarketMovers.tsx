import { useGetChartBySymbol } from "@/hooks/chart/useGetChart";
import { MiniChart } from "@/features/chart/MiniChart";
import { cn } from "@/lib/utils";

interface MarketMoverCardProps {
  symbol: string;
  displayName: string;
}

function MarketMoverCard({ symbol, displayName }: MarketMoverCardProps) {
  const { data, isLoading } = useGetChartBySymbol(symbol, "1h");
  console.log("data", data);

  // Calculate price change percentage (24h equivalent)
  const priceChange =
    data?.ohlcData && data.ohlcData.length > 0
      ? ((data.ohlcData[data.ohlcData.length - 1].close -
          data.ohlcData[0].open) /
          data.ohlcData[0].open) *
        100
      : 0;

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">
          {displayName}
        </h3>
      </div>
      <div className="text-xl font-bold mb-4">
        $
        {currentPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <div className="h-40 mt-2 bg-black">
        {data?.ohlcData && data.ohlcData.length > 0 ? (
          <div className="bg-black">
            <MiniChart
              klines={data.ohlcData}
              width={400}
              height={160}
              upColor="#5dc887"
              downColor="#e35561"
              periods={50}
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
    <div className="container mx-auto px-4">
      <div className="flex justify-center gap-4">
        {movers.map((mover) => (
          <MarketMoverCard
            key={mover.symbol}
            symbol={mover.symbol}
            displayName={mover.displayName}
          />
        ))}
      </div>
    </div>
  );
}
