import type { OHLCVExtended } from "@/types/ohlcv";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

type ChartProps = {
  klines: OHLCVExtended[];
  upColor?: string;
  downColor?: string;
  symbol: string;
};

export const IndexChart: React.FC<ChartProps> = (props) => {
  const { klines, downColor, upColor, symbol } = props;

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
        background: { type: ColorType.Solid, color: "black" },
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
    const chartData: CandlestickData[] = klines.map((kline) => {
      const time = (new Date(kline.time).getTime() / 1000) as Time;
      return {
        time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      };
    });

    candlestickSeries.setData(chartData);
    candlestickSeries.applyOptions({
      // lastValueVisible: true, // hides the price on the right scale
      // priceLineVisible: true, // hides the horizontal last price line
    });

    // Fit content to visible area
    chart.timeScale().fitContent();

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [klines, upColor, downColor]);

  return (
    <div ref={chartContainerRef} className="rounded-md h-full w-full relative">
      <div className="absolute left-3 right-3 z-10">
        <h4>{symbol.replace("USDT", "")}</h4>
      </div>
    </div>
  );
};
