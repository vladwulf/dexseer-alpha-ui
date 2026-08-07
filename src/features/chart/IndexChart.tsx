import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { parseCandleTime } from "@/lib/parseCandleTime";
import type { OHLCVExtended } from "@/types/ohlcv";
import { normalizeChartData } from "./normalizeChartData";

type ChartProps = {
  dataKey?: string | number;
  initialVisibleCandleCount?: number;
  interactive?: boolean;
  klines: OHLCVExtended[];
  upColor?: string;
  downColor?: string;
  showVolume?: boolean;
};

export const IndexChart: React.FC<ChartProps> = (props) => {
  const {
    interactive = false,
    initialVisibleCandleCount,
    dataKey,
    klines,
    downColor,
    showVolume = false,
    upColor,
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const volumeSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const currentDataKeyRef = useRef<string | number | undefined>(undefined);
  const firstCandleTimeRef = useRef<Time | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance with dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0e0e0e" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      autoSize: true,
      timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: true, // Show time in addition to date
        secondsVisible: false,
        shiftVisibleRangeOnNewBar: true,
        tickMarkFormatter: (time: number) => {
          // Convert Unix timestamp to local time for axis labels
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        },
      },
      rightPriceScale: {
        visible: true, // Hide price scale for cleaner mini chart
        borderVisible: false,
        autoScale: true,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        mode: interactive ? 0 : 1,
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: interactive,
        horzTouchDrag: interactive,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: false,
        pinch: false,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => {
          // Show appropriate precision based on price magnitude
          if (price < 0.001) {
            return price.toFixed(8);
          } else if (price < 0.01) {
            return price.toFixed(7);
          } else if (price < 1) {
            return price.toFixed(6);
          } else {
            return price.toFixed(2);
          }
        },
        minMove: 0.00000001,
      },
    });

    candlestickSeries.applyOptions({
      // lastValueVisible: true, // hides the price on the right scale
      // priceLineVisible: true, // hides the horizontal last price line
    });

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.78, bottom: 0 },
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      chart.remove();
    };
  }, [downColor, interactive, showVolume, upColor]);

  useEffect(() => {
    const chart = chartRef.current;
    const candlestickSeries = candlestickSeriesRef.current;

    if (!chart || !candlestickSeries || klines.length === 0) {
      return;
    }

    const chartData: CandlestickData[] = normalizeChartData(
      klines
        .filter(
          (kline) =>
            kline.open != null &&
            kline.high != null &&
            kline.low != null &&
            kline.close != null,
        )
        .map((kline) => ({
          time: parseCandleTime(kline.time) as Time,
          open: kline.open,
          high: kline.high,
          low: kline.low,
          close: kline.close,
        })),
    );
    const volumeData = klines.map((kline) => ({
      time: parseCandleTime(kline.time) as Time,
      value: Number(kline.asset_volume) || 0,
      color:
        kline.close >= kline.open
          ? "rgba(38, 194, 129, 0.62)"
          : "rgba(236, 85, 100, 0.62)",
    }));
    const firstCandleTime = chartData[0]?.time ?? null;
    const shouldResetData =
      currentDataKeyRef.current !== dataKey ||
      firstCandleTimeRef.current !== firstCandleTime;

    if (shouldResetData) {
      const isNewDataSet = currentDataKeyRef.current !== dataKey;
      const visibleRange = isNewDataSet
        ? null
        : chart.timeScale().getVisibleLogicalRange();

      candlestickSeries.setData(chartData);
      volumeSeriesRef.current?.setData(volumeData);
      if (visibleRange) {
        chart.timeScale().setVisibleLogicalRange(visibleRange);
      } else if (initialVisibleCandleCount) {
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, chartData.length - initialVisibleCandleCount),
          to: chartData.length - 1,
        });
      } else {
        chart.timeScale().fitContent();
      }
      currentDataKeyRef.current = dataKey;
      firstCandleTimeRef.current = firstCandleTime;
      return;
    }

    const latestCandle = chartData.at(-1);
    const latestVolume = volumeData.at(-1);

    if (latestCandle) {
      candlestickSeries.update(latestCandle);
    }
    if (latestVolume) {
      volumeSeriesRef.current?.update(latestVolume);
    }
  }, [dataKey, initialVisibleCandleCount, klines]);

  return (
    <div
      ref={chartContainerRef}
      className={`relative h-full w-full rounded-md bg-[#0e0e0e] ${
        interactive ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""
      }`}
    ></div>
  );
};
