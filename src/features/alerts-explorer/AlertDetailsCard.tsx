import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertChart, type AlertChartActiveCandle } from "../chart/AlertChart";
import { useGetAlertChart } from "./hooks/alerts.api";

type Props = {
  symbol: string;
  assetId: number;
  alertId: number;
  alertTime: string;
  alertType: string;
};
export const AlertDetailsCard: React.FC<Props> = (props) => {
  const { alertId, alertTime, alertType, assetId, symbol } = props;
  const { data: chart } = useGetAlertChart(String(alertId), "15m");
  const [activeCandle, setActiveCandle] =
    useState<AlertChartActiveCandle | null>(null);

  const handleActiveCandleChange = useCallback(
    (nextActiveCandle: AlertChartActiveCandle) => {
      setActiveCandle(nextActiveCandle);
    },
    [],
  );

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
        <div className="h-[300px] w-full">
          <AlertChart
            alertTime={alertTime}
            onActiveCandleChange={handleActiveCandleChange}
            series={chart ?? []}
            showLegend={false}
          />
        </div>
      </div>
      <AlertDetailsFooter activeCandle={activeCandle} />
    </Card>
  );
};

function AlertDetailsFooter({
  activeCandle,
}: {
  activeCandle: AlertChartActiveCandle | null;
}) {
  if (!activeCandle) {
    return null;
  }

  const { candle, timeDisplay } = activeCandle;

  const priceMetrics = [
    { label: "O", value: formatPrice(candle.open) },
    { label: "H", value: formatPrice(candle.high) },
    { label: "L", value: formatPrice(candle.low) },
    { label: "C", value: formatPrice(candle.close) },
  ];
  const indicatorMetrics = [
    { label: "Vol", value: formatVolume(candle.asset_volume) },
    { label: "RelVol", value: `1p:${formatNumber(candle.rel_vol_1p, 1)}x` },
    { label: "16p", value: `${formatNumber(candle.rel_vol_16p, 1)}x` },
    { label: "96p", value: `${formatNumber(candle.rel_vol_96p, 1)}x` },
    { label: "EMA", value: `9:${formatNumber(candle.ema9, 4)}` },
    { label: "20", value: formatNumber(candle.ema20, 4) },
    { label: "50", value: formatNumber(candle.ema50, 4) },
    { label: "100", value: formatNumber(candle.ema100, 4) },
    { label: "200", value: formatNumber(candle.ema200, 4) },
    { label: "MACD", value: `L:${formatNumber(candle.macd_line, 4)}` },
    { label: "S", value: formatNumber(candle.macd_signal, 4) },
    { label: "H", value: formatNumber(candle.macd_histogram, 4) },
    { label: "Slp", value: formatNumber(candle.macd_signal_slope, 4) },
    { label: "ATR", value: formatNumber(candle.atr14, 4) },
    { label: "ADX", value: formatNumber(candle.adx14, 1) },
    { label: "Chop", value: formatNumber(candle.choppiness_index_14, 1) },
    { label: "RngZ", value: formatNumber(candle.range_z, 2) },
    { label: "RVZ", value: formatNumber(candle.rvol_z_sustained, 2) },
    { label: "MvZ", value: formatNumber(candle.move_z, 2) },
    {
      label: "Brk 16p",
      value: `up:${formatBool(candle.is_16p_breakout)} dn:${formatBool(candle.is_16p_breakdown)}`,
    },
    {
      label: "96p",
      value: `up:${formatBool(candle.is_96p_breakout)} dn:${formatBool(candle.is_96p_breakdown)}`,
    },
  ];

  return (
    <footer className="mt-3 border-t border-white/10 pt-2 text-[11px] font-light leading-4 text-gray-300">
      <div className="mb-1 text-xs text-gray-400">{timeDisplay}</div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {priceMetrics.map((metric) => (
          <Metric key={metric.label} {...metric} />
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {indicatorMetrics.map((metric) => (
          <Metric key={`${metric.label}-${metric.value}`} {...metric} />
        ))}
      </div>
    </footer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-gray-400">{label}:</span> {value}
    </span>
  );
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value == null) return "-";
  return value.toFixed(digits);
}

function formatPrice(value: number) {
  if (value < 0.001) return value.toFixed(8);
  if (value < 0.01) return value.toFixed(7);
  if (value < 1) return value.toFixed(6);
  return value.toFixed(2);
}

function formatVolume(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

function formatBool(value: boolean | null | undefined) {
  if (value == null) return "-";
  return value ? "Y" : "N";
}
