import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type {
  CandlestickData,
  CandlestickSeriesPartialOptions,
  Time,
} from "lightweight-charts";
import type { KLine } from "@/patterns/types/binance.types";

/**
 * Price line configuration for pattern analysis
 *
 * @example Basic usage
 * ```tsx
 * const priceLine: PatternPriceLine = {
 *   price: 0.00892,
 *   color: '#22c55e',
 *   lineWidth: 2,
 *   lineStyle: 2, // Dashed
 *   title: 'Support Level',
 *   axisLabelVisible: true,
 * };
 *
 * <Chart customPriceLines={[priceLine]} />
 * ```
 *
 * @example ABCD Pattern levels
 * ```tsx
 * const abcdLevels: PatternPriceLine[] = [
 *   { price: 0.00890, color: '#22c55e', title: 'Point A', lineStyle: 0 },
 *   { price: 0.00935, color: '#ef4444', title: 'Point B', lineStyle: 0 },
 *   { price: 0.00918, color: '#22c55e', title: 'Point C', lineStyle: 0 },
 *   { price: 0.00960, color: '#8b5cf6', title: 'Point D', lineStyle: 2 },
 * ];
 *
 * <Chart customPriceLines={abcdLevels} showDefaultLevels={false} />
 * ```
 *
 * Line Styles (from TradingView Lightweight Charts):
 * - 0: Solid
 * - 1: Dotted
 * - 2: Dashed
 * - 3: LargeDashed
 * - 4: SparseDotted
 *
 * @see https://tradingview.github.io/lightweight-charts/tutorials/how_to/price-line
 */
export interface PatternPriceLine {
  price: number;
  color: string;
  lineWidth?: number;
  lineStyle?: 0 | 1 | 2 | 3 | 4; // Solid | Dotted | Dashed | LargeDashed | SparseDotted
  title: string;
  axisLabelVisible?: boolean;
}

/**
 * Optional color override for specific candles
 */
export interface CandleColorOverride {
  index: number;
  color?: string;
  borderColor?: string;
  wickColor?: string;
}

interface ChartProps {
  klines: KLine[]; // Timeseries data
  height?: number;
  customPriceLines?: PatternPriceLine[];
  showDefaultLevels?: boolean;
  candleColorOverrides?: CandleColorOverride[]; // Override colors for pattern recognition
  upColor?: string;
  downColor?: string;
}

export function Chart({
  klines,
  height = 600,
  customPriceLines = [],
  showDefaultLevels = true,
  candleColorOverrides = [],
  upColor = "#22c55e",
  downColor = "#ef4444",
}: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      rightPriceScale: {
        visible: true,
        borderVisible: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        minimumWidth: 80,
      },
      localization: {
        priceFormatter: (price: number) => {
          // Show up to 8 decimal places for small numbers
          if (price < 0.01) {
            return price.toFixed(8);
          } else if (price < 1) {
            return price.toFixed(6);
          } else {
            return price.toFixed(2);
          }
        },
      },
      crosshair: {
        mode: 1,
      },
    });

    // Create candlestick series
    const seriesOptions: CandlestickSeriesPartialOptions = {
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
        minMove: 0.00000001, // Allow 8 decimal precision
      },
    };
    const candlestickSeries = chart.addSeries(CandlestickSeries, seriesOptions);

    // Convert Binance K-line data to lightweight-charts format
    const chartData: CandlestickData[] = klines.map((kline, index) => {
      const baseData = {
        time: Math.floor(kline[0] / 1000) as Time,
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      };

      // Apply color overrides if any
      const override = candleColorOverrides.find((o) => o.index === index);
      console.log("override", override);
      if (override) {
        return {
          ...baseData,
          color: override.color,
          borderColor: override.borderColor,
          wickColor: override.wickColor,
        };
      }

      return baseData;
    });

    candlestickSeries.setData(chartData);

    // Add default support/resistance levels if enabled
    if (showDefaultLevels) {
      // Calculate key price levels for ABCD pattern analysis
      let minPrice = chartData[0].low;
      let maxPrice = chartData[0].high;

      for (let i = 1; i < chartData.length; i++) {
        if (chartData[i].high > maxPrice) {
          maxPrice = chartData[i].high;
        }
        if (chartData[i].low < minPrice) {
          minPrice = chartData[i].low;
        }
      }

      // Calculate mid-level (potential pivot/break of structure level)
      const midPrice = (maxPrice + minPrice) / 2;

      // Add price lines for key levels
      // Resistance line (high)
      candlestickSeries.createPriceLine({
        price: maxPrice,
        color: "#ef4444",
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: "Resistance",
      });

      // Support line (low)
      candlestickSeries.createPriceLine({
        price: minPrice,
        color: "#22c55e",
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: "Support",
      });

      // Mid-level / Break of Structure level
      candlestickSeries.createPriceLine({
        price: midPrice,
        color: "#8b5cf6", // violet color matching your theme
        lineWidth: 2,
        lineStyle: 1, // Dotted
        axisLabelVisible: true,
        title: "Mid Level",
      });
    }

    // Add custom price lines for ABCD pattern analysis
    console.log(`Adding ${customPriceLines.length} custom price lines`);
    customPriceLines.forEach((priceLine) => {
      const lineWidth = (priceLine.lineWidth ?? 2) as 1 | 2 | 3 | 4;
      console.log(
        `Creating price line at ${priceLine.price} with title "${priceLine.title}"`
      );
      candlestickSeries.createPriceLine({
        price: priceLine.price,
        color: priceLine.color,
        lineWidth,
        lineStyle: priceLine.lineStyle ?? 0,
        axisLabelVisible: priceLine.axisLabelVisible ?? true,
        title: priceLine.title,
      });
    });

    // Fit content to visible area
    chart.timeScale().fitContent();

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [
    klines,
    height,
    customPriceLines,
    showDefaultLevels,
    candleColorOverrides,
    upColor,
    downColor,
  ]);

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Price Chart</h2>
        <p className="text-sm text-muted-foreground">
          {klines.length} candlesticks loaded
        </p>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
