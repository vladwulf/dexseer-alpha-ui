import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetAlertChart } from "./hooks/alerts.api";
import { AlertChart } from "../chart/AlertChart";

type Props = {
  symbol: string;
  assetId: number;
  alertId: number;
  alertTime: string;
  alertType: string;
};
export const AlertDetailsCard: React.FC<Props> = (props) => {
  const { alertId, alertTime, alertType, assetId, symbol } = props;
  const { data: charts } = useGetAlertChart(alertId);

  return (
    <Card className="p-3 bg-black transition-colors cursor-pointer rounded-md border-0 ">
      <div className="flex gap-10">
        <div className="flex items-start justify-between mb-2 ">
          <div className="flex-1">
            <div className="">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Symbol: {symbol}</h3>
                <h3 className="font-semibold text-sm">Alert ID: {alertId}</h3>
                <h3 className="font-semibold text-sm">Asset ID: {assetId}</h3>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-normal bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {alertType}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {alertTime ? new Date(alertTime).toISOString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full grid grid-cols-3 gap-5">
          <AlertChart alertTime={alertTime} series={charts?.ohlc1min ?? []} />
          <AlertChart alertTime={alertTime} series={charts?.ohlc5min ?? []} />
          <AlertChart alertTime={alertTime} series={charts?.ohlc15min ?? []} />
        </div>
      </div>
    </Card>
  );
};
