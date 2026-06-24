import { useEffect } from "react";
import { AlertChart } from "../chart/AlertChart";
import type { AlertTimeframe } from "./hooks/alerts.api";
import { useGetAlertChart } from "./hooks/alerts.api";

type Props = {
  alertTime: string;
  alertId: string;
  expectedInstrumentId: string;
  timeframe: AlertTimeframe;
};

export function AlertsChartWrapper(props: Props) {
  const chartData = useGetAlertChart(props.alertId, props.timeframe);

  useEffect(() => {
    if (!import.meta.env.DEV || !chartData.data?.length) return;

    const chartInstrumentId = chartData.data[0]?.instrument_id;
    if (chartInstrumentId && chartInstrumentId !== props.expectedInstrumentId) {
      console.warn("Alert chart instrument mismatch", {
        alertId: props.alertId,
        expectedInstrumentId: props.expectedInstrumentId,
        chartInstrumentId,
      });
    }
  }, [chartData.data, props.alertId, props.expectedInstrumentId]);

  return (
    <div className="h-full min-w-0 overflow-hidden">
      {chartData.isLoading && (
        <div
          className="flex h-full items-center justify-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "oklch(0.45 0 0)",
          }}
        >
          Loading chart...
        </div>
      )}
      {chartData.isError && (
        <div
          className="flex h-full items-center justify-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "#e35561",
          }}
        >
          Chart unavailable
        </div>
      )}
      {!chartData.isLoading &&
        !chartData.isError &&
        chartData.data?.length === 0 && (
          <div
            className="flex h-full items-center justify-center"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "oklch(0.45 0 0)",
            }}
          >
            No chart data
          </div>
        )}
      {!chartData.isLoading &&
        !chartData.isError &&
        Boolean(chartData.data?.length) && (
          <AlertChart
            alertTime={props.alertTime}
            series={chartData.data ?? []}
          />
        )}
    </div>
  );
}
