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
  klines: OHLCVExtended[];
  upColor?: string;
  downColor?: string;
  showVolume?: boolean;
};

export const IndexChart: React.FC<ChartProps> = (props) => {
  const { klines, downColor, showVolume = false, upColor } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

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
        mode: 1, // Disable crosshair for cleaner mini chart
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
        horzTouchDrag: false,
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

    // Convert OHLCVExtended data to candlestick format (based on MicroChart)
    const chartData: CandlestickData[] = normalizeChartData(
      klines
        .filter(
          (kline) =>
            kline.open != null &&
            kline.high != null &&
            kline.low != null &&
            kline.close != null,
        )
        .map((kline) => {
          const time = parseCandleTime(kline.time) as Time;
          return {
            time,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
          };
        }),
    );

    candlestickSeries.setData(chartData);
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
      volumeSeries.setData(
        klines.map((kline) => ({
          time: parseCandleTime(kline.time) as Time,
          value: Number(kline.asset_volume) || 0,
          color:
            kline.close >= kline.open
              ? "rgba(38, 194, 129, 0.62)"
              : "rgba(236, 85, 100, 0.62)",
        })),
      );
    }

    // Fit content to visible area
    chart.timeScale().fitContent();

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [downColor, klines, showVolume, upColor]);

  return (
    <div
      ref={chartContainerRef}
      className="relative h-full w-full rounded-md bg-[#0e0e0e]"
    ></div>
  );
};
