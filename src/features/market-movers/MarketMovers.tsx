import { useMemo } from "react";
import { useGetChartBySymbol } from "@/hooks/chart/useGetChart";
import { useLiveChartSeries } from "@/hooks/chart/useLiveChartSeries";
import { IndexChart } from "../chart/IndexChart";

interface MarketMoverCardProps {
  symbol: string;
  displayName: string;
  ticker: string;
}

function MarketMoverCard({
  symbol,
  displayName,
  ticker,
}: MarketMoverCardProps) {
  const { data, isLoading } = useGetChartBySymbol(symbol, "15m", 500);
  const liveCharts = useLiveChartSeries({
    timeframe: "15m",
    seeds:
      data === undefined
        ? []
        : [
            {
              assetId: data.asset.id,
              data: data.ohlcData,
            },
          ],
  });
  const ohlc = useMemo(() => {
    if (!data) {
      return [];
    }

    return liveCharts.seriesByAssetId.get(data.asset.id) ?? data.ohlcData;
  }, [data, liveCharts.seriesByAssetId]);

  const currentPrice = ohlc.length > 0 ? ohlc[ohlc.length - 1].close : 0;
  const openPrice = ohlc.length > 0 ? ohlc[0].open : 0;
  const priceChange =
    openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  const formatPrice = (p: number) => {
    if (p >= 1000)
      return p.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(2);
    return p.toFixed(4);
  };

  if (isLoading) {
    return (
      <div
        className="flex-1 rounded-lg p-3"
        style={{
          background: "#0a0a0a",
          border: "1px solid oklch(1 0 0 / 7%)",
        }}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-16 rounded bg-white/5" />
          <div className="h-5 w-28 rounded bg-white/5" />
          <div className="h-4 w-20 rounded bg-white/5" />
          <div className="mt-2 h-28 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-hidden rounded-lg transition-all duration-200"
      style={{
        background: "#0a0a0a",
        border: "1px solid oklch(1 0 0 / 7%)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-[2px] w-full"
        style={{
          background: isPositive
            ? "linear-gradient(90deg, transparent, #5dc887, transparent)"
            : "linear-gradient(90deg, transparent, #e35561, transparent)",
        }}
      />

      <div className="p-3">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "oklch(0.48 0 0)",
                marginBottom: "2px",
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "oklch(0.96 0 0)",
              }}
            >
              {ticker}
            </p>
          </div>

          {/* Price + change */}
          <div className="text-right">
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "oklch(0.92 0 0)",
                letterSpacing: "-0.01em",
              }}
            >
              ${formatPrice(currentPrice)}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                fontWeight: 500,
                color: isPositive ? "#5dc887" : "#e35561",
                letterSpacing: "0.02em",
              }}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-28 w-full">
          {ohlc.length > 0 ? (
            <IndexChart
              symbol={symbol}
              klines={ohlc}
              upColor="#5dc887"
              downColor="#e35561"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/20">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const movers = [
  { symbol: "BTCUSDT", displayName: "Bitcoin", ticker: "BTC/USDT" },
  { symbol: "ETHUSDT", displayName: "Ethereum", ticker: "ETH/USDT" },
  { symbol: "SOLUSDT", displayName: "Solana", ticker: "SOL/USDT" },
];

export function MarketMovers() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Section label */}
      <div className="mb-3 flex items-center gap-3">
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "oklch(0.45 0 0)",
          }}
        >
          Market Overview
        </p>
        <div
          className="h-px flex-1"
          style={{ background: "oklch(1 0 0 / 6%)" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {movers.map((mover) => (
          <MarketMoverCard
            key={mover.symbol}
            symbol={mover.symbol}
            displayName={mover.displayName}
            ticker={mover.ticker}
          />
        ))}
      </div>
    </div>
  );
}
