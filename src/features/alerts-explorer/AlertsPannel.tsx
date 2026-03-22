import { useGetAlertsPaginated } from "./hooks/alerts.api";
import { AlertDetailsCard } from "./AlertDetailsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertChart } from "../chart/AlertChart";
import { AlertsChartWrapper } from "./AlertChartWrapper";

export function AlertsPannel() {
  const { data } = useGetAlertsPaginated("15m", 100);
  const alerts = data?.pages.flatMap((p) => p.data);

  return (
    <div>
      <div className="px-4 pb-4 max-h-screen overflow-auto mt-10 space-y-10">
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

            <div className="h-[400px] w-full">
              <AlertsChartWrapper alertTime={alert.time} alertId={alert.id} />
              {/* <AlertChart alert={alert} series={alert.ohlc ?? []} /> */}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
