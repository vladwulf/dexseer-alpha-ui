import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type Time,
  HistogramSeries,
  createSeriesMarkers,
} from "lightweight-charts";
import type { OHLCVExtended } from "@/types/ohlcv";
import { MARibbonIndicator } from "./indicators/ma-ribbon-plugin";

interface ChartEvent {
  type: string;
  time: number;
}

interface MiniChartProps {
  klines: OHLCVExtended[];
  assetName?: string;
  width?: string;
  height?: string;
  upColor?: string;
  downColor?: string;
  /**
   * Number of periods (candlesticks) to render.
   * If not provided, renders all periods.
   * Takes the most recent N periods from the klines array.
   */
  periods?: number;
  events?: ChartEvent[];
}

export function StandardChartLight({
  klines,
  assetName,
  width = "100%",
  height = "100%",
  upColor = "#22c55e", // Default green for up candles
  downColor = "#ef4444", // Default red for down candles
  periods = 200,
  events,
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  if (events && events?.length > 0) {
    const minTimestamp = klines[0].timestamp;
    const maxTimestamp = klines[klines.length - 1].timestamp;
    events = events.filter(
      (event) =>
        new Date(event.time).getTime() > new Date(minTimestamp).getTime()
    );
  }

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Limit the number of periods to render
    // const dataToRender = periods
    //   ? klines.slice(-periods) // Take the last N periods
    //   : klines;

    // Create chart instance with dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#09090b" },
        textColor: "#d1d5db",
      },
      autoSize: true,
      grid: {
        vertLines: {
          visible: false,
          color: "rgba(255, 255, 255, 0.05)",
        },
        horzLines: {
          visible: true,
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      width: Number(width),
      height: Number(height),
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
      localization: {
        timeFormatter: (timestamp: number) => {
          // Convert Unix timestamp to local time for crosshair
          const date = new Date(timestamp * 1000);
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        },
      },
      rightPriceScale: {
        visible: true, // Hide price scale for cleaner mini chart
        borderVisible: true,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        mode: 0, // Normal crosshair mode
        vertLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.3)",
          style: 3, // Dashed line
        },
        horzLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.3)",
          style: 3,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
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
      priceLineVisible: false,
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

    if (events && events.length > 0) {
      createSeriesMarkers(
        candlestickSeries,
        events?.map((e) => {
          if (e.type === "VOLUME_SURGE_DOWN") {
            return {
              time: (new Date(e.time).getTime() / 1000) as Time,
              position: "aboveBar",
              color: "#FFEC00",
              shape: "arrowDown",
              text: e.type,
            };
          } else {
            return {
              time: (new Date(e.time).getTime() / 1000) as Time,
              position: "belowBar",
              color: "#6be671",
              shape: "arrowUp",
              text: e.type,
            };
          }
        })
      );
    }

    // Create MA ribbon between sma9 and sma20
    const ribbonPlugin = new MARibbonIndicator({
      fillColor: "rgba(100, 100, 100, 0.2)", // Default fallback color
      lineWidth: 0,
    });
    candlestickSeries.attachPrimitive(ribbonPlugin);

    // prepare ribbon data
    const ribbonData = klines
      .filter((kline) => kline.ema9 && kline.ema20)
      .map((kline) => {
        const point9 = kline.ema9;
        const point20 = kline.ema20;
        const macdHistogram = kline.macd_histogram;

        if (!point20 || !point9 || !macdHistogram) return null;

        const ema9Above = point9 > point20;
        const macdPositive = macdHistogram && macdHistogram > 0;
        const macdNegative = macdHistogram && macdHistogram < 0;

        let color: string;

        if (ema9Above) {
          // EMA9 > EMA20: green if MACD positive, else gray
          color = macdPositive ? "#6be671" : "rgba(100, 100, 100, 0.2)";
        } else {
          // EMA9 < EMA20: red if MACD positive, else gray
          color = macdNegative ? "#FF244D" : "rgba(100, 100, 100, 0.2)";
        }

        return {
          time: (new Date(kline.timestamp).getTime() / 1000) as Time,
          upper: point9,
          lower: point20,
          color, // Set color per timepoint
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    ribbonPlugin.setData(ribbonData);

    candlestickSeries.setData(
      klines.map((kline) => ({
        time: (new Date(kline.timestamp).getTime() / 1000) as Time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // set as an overlay by setting a blank priceScaleId
    });
    volumeSeries.priceScale().applyOptions({
      // set the positioning of the volume series
      scaleMargins: {
        top: 0.8, // highest point of the series will be 70% away from the top
        bottom: 0,
      },
    });

    volumeSeries.setData(
      klines.map((kline) => ({
        time: (new Date(kline.timestamp).getTime() / 1000) as Time,
        value: kline.quote_volume,
        color: kline.close > kline.open ? upColor : downColor,
      }))
    );

    // Fit content to visible area
    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [klines, width, height, upColor, downColor, periods, events]);

  return (
    <div
      ref={chartContainerRef}
      className="rounded-md w-full h-full relative"
      style={{ width, height }}
    />
  );
}
