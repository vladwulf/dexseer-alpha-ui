import ScrollContainer from "react-indiana-drag-scroll";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetAlerts } from "./hooks/useGetAlerts";
import { AlertChart } from "../chart/AlertChart";
import { useEffect } from "react";
import { analyzeAlerts, analyzeAlertsByType } from "./alert-perf";

export function AlertsSidePanel() {
  const { data: alerts } = useGetAlerts();

  useEffect(() => {
    if (alerts && alerts?.length > 0) {
      const longAlerts = alerts.filter((a) => a.type === "VOLUME_SURGE_LONG");
      const shortAlerts = alerts.filter((a) => a.type === "VOLUME_SURGE_SHORT");

      if (longAlerts.length > 0) {
        const longResults = analyzeAlerts(longAlerts);
        console.log("longResults", longResults);
        console.log(longResults.summary);
      }

      if (shortAlerts.length > 0) {
        const shortResults = analyzeAlerts(shortAlerts);
        console.log("shortResults", shortResults);
        console.log(shortResults.summary);
      }
    }
  }, [alerts]);

  return (
    <div className="border-border bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold mb-2">Market Alerts</h2>
        {/* <div className="flex gap-2 text-sm text-muted-foreground">
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
        </div> */}
      </div>

      <div className="px-4 pb-4 max-h-screen overflow-auto">
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

            <div className="h-[180px] w-full">
              <AlertChart alert={alert} series={alert.ohlc ?? []} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
