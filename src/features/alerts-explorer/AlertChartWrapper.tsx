import type { OHLCVExtended } from "@/types/ohlcv";
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

  console.log("alertId", props.alertId, "chartData15m", chartData15m.data);

  // return (
  //   <AlertChart alertTime={props.alertTime} series={chartData15m.data ?? []} />
  // );

  return (
    <div className="grid grid-cols-3 gap-5 h-full">
      <AlertChart alertTime={props.alertTime} series={chartData1s.data ?? []} />
      <AlertChart alertTime={props.alertTime} series={chartData1m.data ?? []} />
      <AlertChart
        alertTime={props.alertTime}
        series={chartData15m.data ?? []}
      />
    </div>
  );
}
