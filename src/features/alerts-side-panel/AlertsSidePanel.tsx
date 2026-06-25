import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertChart } from "../chart/AlertChart";
import { useGetAlerts } from "./hooks/useGetAlerts";

function AlertSkeleton() {
  return (
    <div className="p-3 rounded-md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-16 bg-muted/40 rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted/40 rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-[260px] w-full bg-muted/20 rounded animate-pulse" />
    </div>
  );
}

export function AlertsSidePanel() {
  const { data: alerts, isLoading } = useGetAlerts();

  return (
    <div className="border-border bg-black flex flex-col">
      <div className="p-4 border-b border-border h-26">
        <h2 className="text-xl font-semibold mb-2">Market Alerts</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            className="hover:text-foreground transition-colors"
          >
            All
          </button>
          <span>•</span>
          <button
            type="button"
            className="hover:text-foreground transition-colors"
          >
            Rally
          </button>
          <span>•</span>
          <button
            type="button"
            className="hover:text-foreground transition-colors"
          >
            Pullback
          </button>
          <span>•</span>
          <button
            type="button"
            className="hover:text-foreground transition-colors"
          >
            Breakout
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 max-h-screen overflow-auto mt-10">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <AlertSkeleton key={i} />
          ))}
        {alerts?.map((alert) => (
          <Card
            key={alert.id}
            className="p-3 bg-black transition-colors cursor-pointer rounded-md border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="">
                  <h3 className="font-semibold text-sm">
                    {alert.asset.symbol}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal bg-blue-500/10 text-blue-400 border-blue-500/20"
                  >
                    {alert.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {alert.time ? new Date(alert.time).toLocaleString() : "N/A"}
                  </span>
                  {/* <span>{alert.tradingVolume.toLocaleString()} trading</span> */}
                </div>
              </div>
              {/* <div
                  className={cn(
                    "text-lg font-semibold",
                    alert.change24h > 0 ? "text-[#5dc887]" : "text-[#e35561]"
                  )}
                >
                  {alert.change24h > 0 ? "+" : ""}
                  {alert.change24h.toFixed(2)}%
                </div> */}
            </div>

            <div className="h-[260px] w-full">
              <AlertChart alertTime={alert.time} series={alert.ohlc ?? []} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
