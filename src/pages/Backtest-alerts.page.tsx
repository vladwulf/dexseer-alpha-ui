import { AlertsSidePanelBacktest } from "@/features/alerts-side-panel/AlertsSidePanelBacktest";
import { AssetSearch2 } from "@/features/backtest/AssetSearch2";
import { useGetChart } from "@/features/backtest/hooks/useGetChart";
import { useGetTopAlertsWithWindow } from "@/features/backtest/hooks/useGetTopAlertsWithWindow";
import { useBacktestStore2 } from "@/features/backtest/store/backtest2.store";
import { StandardChartLight } from "@/features/chart/StandardChartLight";

export default function BacktestAlertsPage() {
  const selectedAssetId = useBacktestStore2((state) => state.selectedAssetId);
  // const { data: chartData1m } = useGetChart(selectedAssetId, "1m");
  const { data: chartData5m } = useGetChart(selectedAssetId, "5m");
  const { data: chartData15m } = useGetChart(selectedAssetId, "15m");
  const { data: alerts } = useGetTopAlertsWithWindow(100);
  console.log("alerts", alerts?.data);

  return (
    <div>
      <div className="max-w-sm mx-auto">
        <AssetSearch2 />
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-12 gap-4 mx-auto px-4">
          <div className="col-span-9 space-y-8">
            {/* <StandardChartLight
            klines={chartData1m?.data.ohlcs ?? []}
            events={
              chartData1m?.data.alerts.map((alert) => ({
                type: alert.type,
                time: new Date(alert.timestamp).getTime(),
              })) ?? []
            }
            assetName={`${"test"} - 1m`}
            periods={500}
            height="600px"
            width="100%"
          /> */}
            {/* <StandardChartLight
              klines={chartData5m?.data.ohlcs ?? []}
              events={
                chartData5m?.data.alerts.map((alert) => ({
                  type: alert.type,
                  time: new Date(alert.timestamp).getTime(),
                })) ?? []
              }
              assetName={`${"test"} - 5m`}
              periods={500}
              height="600px"
              width="80%"
            />
            <StandardChartLight
              klines={chartData15m?.data.ohlcs ?? []}
              events={
                chartData15m?.data.alerts.map((alert) => ({
                  type: alert.type,
                  time: new Date(alert.timestamp).getTime(),
                })) ?? []
              }
              assetName={`${"test"} - 15m`}
              periods={500}
              height="600px"
              width="80%"
            /> */}
          </div>
          <div className="col-span-3 justify-items-end">
            <AlertsSidePanelBacktest alerts={alerts?.data ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
