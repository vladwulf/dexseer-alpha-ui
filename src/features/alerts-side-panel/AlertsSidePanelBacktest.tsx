import { MicroChart } from "@/features/chart/MicroChart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import kLinesData from "@/patterns/abcd/data/k-lines.json";
import type { KLine } from "@/patterns/types/binance.types";
import type { AlertWithWindow } from "@/types/ohlcv";

type AlertsSidePanelBacktestProps = {
  alerts: AlertWithWindow[];
};

export function AlertsSidePanelBacktest({
  alerts,
}: AlertsSidePanelBacktestProps) {
  console.log("alerts", alerts);
  return (
    <div className="w-96 h-full border-l border-border bg-[#09090b] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold mb-2">Market Alerts</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition-colors">
            All
          </button>
          <span>•</span>
          <button className="hover:text-foreground transition-colors">
            Rally
          </button>
          <span>•</span>
          <button className="hover:text-foreground transition-colors">
            Pullback
          </button>
          <span>•</span>
          <button className="hover:text-foreground transition-colors">
            Breakout
          </button>
        </div>
      </div>

      {/* Scrollable alerts list */}
      <div className="flex-1 max-h-[calc(100vh-150px)] overflow-y-auto">
        <div className="p-3 space-y-2">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="p-3 bg-[#09090b] transition-colors cursor-pointer border-border rounded-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">
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
                    <span>{new Date(alert.time).toLocaleString()}</span>
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

              <div className="mt-1.5">
                <MicroChart
                  alertTimestamp={alert.time}
                  klines={alert.ohlc ?? []}
                  width={320}
                  height={150}
                  periods={100}
                  upColor="#5dc887"
                  downColor="#e35561"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
