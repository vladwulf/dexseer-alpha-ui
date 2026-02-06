import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { Time } from "lightweight-charts";
import { MiniChart } from "./MiniChart";
import type { OHLCVExtended } from "@/types/ohlcv";

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface MicroChartProps {
  alertTimestamp: string;
  klines: OHLCVExtended[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
  /**
   * Number of periods (candlesticks) to render.
   * If not provided, renders all periods.
   * Takes the most recent N periods from the klines array.
   */
  periods?: number;
  /**
   * Mouse event handlers (for use with MiniChartModal)
   */
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

/**
 * MicroChart - A compact candlestick chart for inline table cells
 *
 * @example
 * ```tsx
 * <MicroChart
 *   klines={klines}
 *   width={100}
 *   height={40}
 *   upColor="#5dc887"
 *   downColor="#e35561"
 *   periods={20}
 * />
 * ```
 */
export function MicroChart({
  alertTimestamp,
  klines,
  width = 100,
  height = 40,
  upColor = "#5dc887", // Green for up candles
  downColor = "#e35561", // Red for down candles
  onMouseEnter,
  onMouseLeave,
}: MicroChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Limit the number of periods to render
    // const dataToRender = periods
    //   ? klines.slice(-periods) // Take the last N periods
    //   : klines;

    // Create chart instance with dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width,
      height,
      timeScale: {
        visible: false, // Hide time scale for micro chart
        borderVisible: false,
      },
      rightPriceScale: {
        visible: false, // Hide price scale for micro chart
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

    // Convert Binance K-line data to candlestick format

    const alertTimestampUnix = (new Date(alertTimestamp).getTime() /
      1000) as Time;

    candlestickSeries.setData(
      klines.map((kline) => {
        const time = (new Date(kline.time).getTime() / 1000) as Time;
        let candleColor = undefined;
        if (time === alertTimestampUnix) {
          candleColor = "yellow";
        } else if (time > alertTimestampUnix) {
          // up color
          if (kline.close > kline.open) {
            candleColor = upColor;
            // down color
          } else {
            candleColor = downColor;
          }
        } else if (time < alertTimestampUnix) {
          // up color
          if (kline.close > kline.open) {
            candleColor = hexToRgba(upColor, 0.5);
            // down color
          } else {
            candleColor = hexToRgba(downColor, 0.5);
          }
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
      }),
    );
    candlestickSeries.applyOptions({
      lastValueVisible: false, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
    });

    // Remove all price lines (including the last price line)
    // Get all price lines and remove them
    const priceLines = candlestickSeries.priceLines();
    priceLines.forEach((priceLine) => {
      candlestickSeries.removePriceLine(priceLine);
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
  }, []);

  return (
    <div
      className="inline-block"
      style={{ width, height }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div ref={chartContainerRef} style={{ width, height }} />
    </div>
  );
}

interface MicroChartWithModalProps extends MicroChartProps {
  /**
   * K-lines data for the mini chart modal
   */
  miniChartKlines: OHLCVExtended[];
  /**
   * Delay before showing modal (ms)
   */
  delay?: number;
  /**
   * Container element where the modal should be rendered.
   * If not provided, defaults to document.body.
   */
  container?: HTMLElement | null;
}

/**
 * MicroChartWithModal - MicroChart with a MiniChart modal on hover
 */
export function MicroChartWithModal({
  klines,
  miniChartKlines,
  width = 100,
  height = 40,
  upColor = "#5dc887",
  downColor = "#e35561",
  periods,
  delay = 300,
  container,
}: MicroChartWithModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine the portal container
  const portalContainer = container !== undefined ? container : document.body;

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      timeoutRef.current = setTimeout(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = 400; // MiniChart default width
        const modalHeight = 200; // MiniChart default height

        // Position modal below the micro chart, pushed more to the bottom and right
        // Same offset as MiniChartModal: 16px below and 16px to the right
        let top = rect.bottom + 16; // 16px gap below
        let left = rect.right + 16; // 16px to the right

        // Adjust if modal goes off screen horizontally
        if (left + modalWidth > viewportWidth - 8) {
          left = viewportWidth - modalWidth - 8;
        }

        // Ensure modal doesn't go off screen on the left
        if (left < 8) {
          left = 8;
        }

        // Adjust if modal goes off screen vertically (below viewport)
        if (top + modalHeight > viewportHeight - 8) {
          // If not enough space below, show above instead
          top = rect.top - modalHeight - 16;
        }

        // Ensure modal doesn't go off screen at the top
        if (top < 8) {
          top = 8;
        }

        setPosition({ top, left });
        setShowModal(true);
      }, delay);
    },
    [delay],
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Add a small delay before hiding to allow mouse to move to modal
    timeoutRef.current = setTimeout(() => {
      setShowModal(false);
      setPosition(null);
    }, 100);
  }, []);

  const handleModalMouseEnter = useCallback(() => {
    // Cancel any pending hide timeout when mouse enters modal
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const modalContent = showModal && position && (
    <div
      ref={modalRef}
      className="fixed z-50 pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseEnter={handleModalMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-auto shadow-lg rounded-lg border border-border bg-card p-2">
        <MiniChart
          klines={miniChartKlines}
          width={400}
          height={200}
          upColor={upColor}
          downColor={downColor}
          periods={periods}
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <MicroChart
          alertTimestamp={"2026-01-17 09:53:00+00"}
          klines={klines}
          width={width}
          height={height}
          upColor={upColor}
          downColor={downColor}
          periods={periods}
        />
      </div>
      {portalContainer
        ? createPortal(modalContent, portalContainer)
        : modalContent}
    </>
  );
}
