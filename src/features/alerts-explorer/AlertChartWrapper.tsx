import { AlertChart } from "../chart/AlertChart";
import { useGetAlertChart } from "./hooks/alerts.api";

type Props = {
  alertTime: string;
  alertId: number;
};
export function AlertsChartWrapper(props: Props) {
  const chartData1s = useGetAlertChart(props.alertId, "1m");
  const chartData1m = useGetAlertChart(props.alertId, "5m");
  const chartData15m = useGetAlertChart(props.alertId, "15m");

  return (
    <div className="grid h-full min-w-0 grid-cols-3 gap-3 overflow-hidden">
      <div className="min-w-0 h-full overflow-hidden">
        <AlertChart alertTime={props.alertTime} series={chartData1s.data ?? []} />
      </div>
      <div className="min-w-0 h-full overflow-hidden">
        <AlertChart alertTime={props.alertTime} series={chartData1m.data ?? []} />
      </div>
      <div className="min-w-0 h-full overflow-hidden">
        <AlertChart
          alertTime={props.alertTime}
          series={chartData15m.data ?? []}
        />
      </div>
    </div>
  );
}
