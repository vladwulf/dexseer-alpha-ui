import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { Time } from "lightweight-charts";
import type { OHLCVExtended } from "@/types/ohlcv";

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface AlertChartProps {
  /**
   * Alert object containing the timestamp and candlestick series data
   */
  alert: {
    time: string;
  };
  series: OHLCVExtended[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
}

/**
 * AlertChart - A candlestick chart that visualizes alerts with opacity variations
 *
 * Candlesticks before the alert timestamp are rendered with lower opacity (0.5),
 * the alert candle is highlighted, and candlesticks after the alert have normal opacity.
 *
 * @example
 * ```tsx
 * <AlertChart
 *   alert={{
 *     time: "2026-01-17 09:53:00+00",
 *     ohlc: ohlcData
 *   }}
 *   width={400}
 *   height={200}
 *   upColor="#5dc887"
 *   downColor="#e35561"
 * />
 * ```
 */
export function AlertChart({
  alert,
  series,
  upColor = "#5dc887", // Green for up candles
  downColor = "#e35561", // Red for down candles
}: AlertChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !series || series.length === 0) return;

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
        borderVisible: true,
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
        visible: false, // Hide price scale
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        mode: 0, // Disable crosshair
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
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

    // Convert alert timestamp to Unix timestamp for comparison
    const alertTimestampUnix = (new Date(alert.time).getTime() / 1000) as Time;

    // Map OHLC data to candlestick format with opacity variations
    const candlestickData = series.map((kline) => {
      const time = (new Date(kline.time).getTime() / 1000) as Time;
      let candleColor: string | undefined;

      if (time === alertTimestampUnix) {
        // Highlight the alert candle
        candleColor = "yellow";
      } else if (time > alertTimestampUnix) {
        // After alert: normal opacity
        candleColor = kline.close > kline.open ? upColor : downColor;
      } else {
        // Before alert: lower opacity (0.5)
        const baseColor = kline.close > kline.open ? upColor : downColor;
        candleColor = hexToRgba(baseColor, 0.5);
      }

      return {
        time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
        color: candleColor,
        borderColor: candleColor,
        wickColor: candleColor,
      };
    });

    candlestickSeries.setData(candlestickData);

    candlestickSeries.applyOptions({
      lastValueVisible: false, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
    });

    // Remove all price lines (including the last price line)
    const priceLines = candlestickSeries.priceLines();
    priceLines.forEach((priceLine) => {
      candlestickSeries.removePriceLine(priceLine);
    });

    // Find the index of the alert candle
    const alertIndex = candlestickData.findIndex(
      (candle) => candle.time === alertTimestampUnix
    );

    // Center the chart on the alert timestamp
    if (alertIndex >= 0 && candlestickData.length > 0) {
      // Calculate how many candles to show (approximately 60% of total, centered on alert)
      const totalCandles = candlestickData.length;
      const visibleCandles = Math.min(
        Math.floor(totalCandles * 0.6),
        totalCandles
      );
      const halfVisible = Math.floor(visibleCandles / 2);

      // Calculate start and end indices
      let startIndex = Math.max(0, alertIndex - halfVisible);
      let endIndex = Math.min(totalCandles - 1, alertIndex + halfVisible);

      // If we're near the start or end, adjust to show more candles
      if (startIndex === 0) {
        endIndex = Math.min(totalCandles - 1, visibleCandles - 1);
      } else if (endIndex === totalCandles - 1) {
        startIndex = Math.max(0, totalCandles - visibleCandles);
      }

      // Set the visible range centered on the alert
      const startTime = candlestickData[startIndex].time;
      const endTime = candlestickData[endIndex].time;

      chart.timeScale().setVisibleRange({
        from: startTime,
        to: endTime,
      });
    } else {
      // Fallback to fitContent if alert candle not found
      chart.timeScale().fitContent();
    }

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [alert, series, upColor, downColor]);

  return (
    <div className="inline-block w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
