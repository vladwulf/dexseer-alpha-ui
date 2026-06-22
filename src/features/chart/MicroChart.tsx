import type { Time } from "lightweight-charts";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
} from "lightweight-charts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { OHLCVExtended } from "@/types/ohlcv";
import { MiniChart } from "./MiniChart";

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const VOLUME_OPACITY = 0.78;

type MicroChartPoint = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color?: string;
  borderColor?: string;
  wickColor?: string;
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
  periods,
  onMouseEnter,
  onMouseLeave,
}: MicroChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const volumeSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const previousSeriesDataRef = useRef<MicroChartPoint[]>([]);

  const seriesData = useMemo(() => {
    const alertTimestampUnix = (new Date(alertTimestamp).getTime() /
      1000) as Time;

    const dataToRender =
      periods !== undefined ? klines.slice(-periods) : klines;

    return dataToRender
      .filter(
        (kline) =>
          kline.open != null &&
          kline.high != null &&
          kline.low != null &&
          kline.close != null,
      )
      .map((kline) => {
        const time = (new Date(kline.time).getTime() / 1000) as Time;
        let candleColor: string | undefined;

        if (time === alertTimestampUnix) {
          candleColor = "yellow";
        } else if (time > alertTimestampUnix) {
          candleColor = kline.close > kline.open ? upColor : downColor;
        } else if (time < alertTimestampUnix) {
          candleColor =
            kline.close > kline.open
              ? hexToRgba(upColor, 0.5)
              : hexToRgba(downColor, 0.5);
        }

        return {
          time,
          open: kline.open,
          high: kline.high,
          low: kline.low,
          close: kline.close,
          volume: Number(kline.asset_volume) || 0,
          color: candleColor,
          borderColor: candleColor,
          wickColor: candleColor,
        };
      });
  }, [alertTimestamp, downColor, klines, periods, upColor]);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

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
        scaleMargins: {
          top: 0.06,
          bottom: 0.26,
        },
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
    candlestickSeries.applyOptions({
      lastValueVisible: false, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
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
    volumeSeriesRef.current = volumeSeries;

    // Cleanup
    return () => {
      volumeSeriesRef.current = null;
      candlestickSeriesRef.current = null;
      chartRef.current = null;
      previousSeriesDataRef.current = [];
      chart.remove();
    };
  }, [downColor, height, upColor, width]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({ width, height });
  }, [height, width]);

  useEffect(() => {
    const candlestickSeries = candlestickSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;

    if (!candlestickSeries || !volumeSeries || !chart) {
      return;
    }

    candlestickSeries.applyOptions({
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    const nextVolumeData = seriesData.map((kline) => ({
      time: kline.time,
      value: kline.volume,
      color:
        kline.close >= kline.open
          ? hexToRgba(upColor, VOLUME_OPACITY)
          : hexToRgba(downColor, VOLUME_OPACITY),
    }));
    const previousSeriesData = previousSeriesDataRef.current;
    const previousLength = previousSeriesData.length;
    const nextLength = seriesData.length;
    const previousLast = previousSeriesData[previousLength - 1];
    const nextLast = seriesData[nextLength - 1];

    // Skip entirely when chart data hasn't changed (common on WS ticks that
    // update prices but not klines — avoids unnecessary canvas repaints).
    if (
      previousLength === nextLength &&
      nextLength > 0 &&
      previousLast?.time === nextLast?.time &&
      previousLast?.open === nextLast?.open &&
      previousLast?.high === nextLast?.high &&
      previousLast?.low === nextLast?.low &&
      previousLast?.close === nextLast?.close &&
      previousLast?.volume === nextLast?.volume &&
      previousLast?.color === nextLast?.color
    ) {
      return;
    }

    const canApplyIncrementalUpdate =
      previousLength > 0 &&
      nextLength > 0 &&
      (nextLength === previousLength || nextLength === previousLength + 1) &&
      previousSeriesData
        .slice(0, Math.min(previousLength, nextLength) - 1)
        .every((point, index) => {
          const nextPoint = seriesData[index];

          return (
            point.time === nextPoint?.time &&
            point.open === nextPoint.open &&
            point.high === nextPoint.high &&
            point.low === nextPoint.low &&
            point.close === nextPoint.close &&
            point.volume === nextPoint.volume &&
            point.color === nextPoint.color &&
            point.borderColor === nextPoint.borderColor &&
            point.wickColor === nextPoint.wickColor
          );
        }) &&
      ((nextLength === previousLength &&
        previousLast?.time === nextLast?.time) ||
        (nextLength === previousLength + 1 &&
          previousLast?.time !== nextLast?.time));

    if (canApplyIncrementalUpdate && nextLast) {
      candlestickSeries.update(nextLast);
      volumeSeries.update(nextVolumeData[nextVolumeData.length - 1]);
    } else {
      candlestickSeries.setData(seriesData);
      volumeSeries.setData(nextVolumeData);
    }

    chart.timeScale().fitContent();
    previousSeriesDataRef.current = seriesData;
  }, [downColor, seriesData, upColor]);

  return (
    <div
      className="inline-block"
      style={{ width, height }}
      onPointerEnter={onMouseEnter}
      onPointerLeave={onMouseLeave}
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
      onPointerEnter={handleModalMouseEnter}
      onPointerLeave={handleMouseLeave}
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
        onPointerEnter={handleMouseEnter}
        onPointerLeave={handleMouseLeave}
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
