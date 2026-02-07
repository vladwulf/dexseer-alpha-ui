import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactElement } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { CandlestickData, Time } from "lightweight-charts";
import type { OHLCVExtended } from "@/types/ohlcv";

interface MiniChartProps {
  klines: OHLCVExtended[];
  upColor?: string;
  downColor?: string;
  /**
   * Number of periods (candlesticks) to render.
   * If not provided, renders all periods.
   * Takes the most recent N periods from the klines array.
   */
  periods?: number;
}

/**
 * MiniChart - A simplified candlestick chart component for hover modals
 *
 * @example
 * ```tsx
 * <MiniChart
 *   klines={klines}
 *   width={300}
 *   height={150}
 *   upColor="#22c55e"
 *   downColor="#ef4444"
 *   periods={50}
 * />
 * ```
 */
export function MiniChart({
  klines,
  upColor = "#22c55e", // Default green for up candles
  downColor = "#ef4444", // Default red for down candles
  periods,
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Limit the number of periods to render
    const dataToRender = periods
      ? klines.slice(-periods) // Take the last N periods
      : klines;

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
        mode: 0, // Disable crosshair for cleaner mini chart
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: true,
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
    const chartData: CandlestickData[] = dataToRender.map((kline) => {
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
      lastValueVisible: false, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
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
  }, [klines, upColor, downColor, periods]);

  return <div ref={chartContainerRef} className="rounded-md h-full w-full" />;
}

interface MiniChartModalProps {
  klines: OHLCVExtended[];
  children: ReactElement;
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
  delay?: number; // Delay before showing modal (ms)
  /**
   * Container element where the modal should be rendered.
   * If not provided, defaults to document.body.
   * Pass null to render in the component tree (not recommended for modals).
   */
  container?: HTMLElement | null;
}

/**
 * MiniChartModal - Wrapper component that shows a mini chart on hover
 * Attaches hover handlers directly to the child element without wrapping it in a div
 *
 * @example
 * ```tsx
 * <MiniChartModal klines={klines}>
 *   <TableRow>...</TableRow>
 * </MiniChartModal>
 * ```
 */
export function MiniChartModal({
  klines,
  children,
  width = 400,
  height = 200,
  upColor,
  downColor,
  periods,
  delay = 300,
  container,
}: MiniChartModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine the portal container
  useEffect(() => {
    if (container !== undefined) {
      // User explicitly provided a container (or null)
      setPortalContainer(container);
    } else {
      // Default to document.body
      setPortalContainer(document.body);
    }
  }, [container]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Get position from the event target
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      timeoutRef.current = setTimeout(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = width;
        const modalHeight = height;

        // Position modal below and to the right of the element
        let top = rect.bottom + 16; // 16px gap below
        let left = rect.right + 16; // 16px to the right

        // Adjust if modal goes off screen horizontally
        if (left + modalWidth > viewportWidth - 8) {
          // If not enough space on the right, shift left to fit
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
    [delay, width, height],
  );

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Add a small delay before hiding to allow mouse to move to modal
    // This prevents flickering when moving from row to modal
    timeoutRef.current = setTimeout(() => {
      setShowModal(false);
      setPosition(null);
    }, 100); // 100ms grace period to move to modal
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Create combined handlers that call both our handlers and any existing ones
  const combinedHandleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      handleMouseEnter(e);
      // Call original handler if it exists
      const originalHandler = (
        children.props as { onMouseEnter?: (e: React.MouseEvent) => void }
      ).onMouseEnter;
      originalHandler?.(e);
    },
    [handleMouseEnter, children],
  );

  const combinedHandleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      handleMouseLeave();
      // Call original handler if it exists
      const originalHandler = (
        children.props as { onMouseLeave?: (e: React.MouseEvent) => void }
      ).onMouseLeave;
      originalHandler?.(e);
    },
    [handleMouseLeave, children],
  );

  // Clone the child element and attach mouse handlers directly to it
  // This works for any element type (table rows, divs, custom components, etc.)
  // eslint-disable-next-line
  const childWithProps = cloneElement(children, {
    onMouseEnter: combinedHandleMouseEnter,
    onMouseLeave: combinedHandleMouseLeave,
  } as Partial<unknown>);

  const handleModalMouseEnter = useCallback(() => {
    // Cancel any pending hide timeout when mouse enters modal
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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
      <div className="pointer-events-auto border shadow-lg rounded-lg bg-base">
        <MiniChart
          klines={klines}
          upColor={upColor}
          downColor={downColor}
          periods={periods}
        />
      </div>
    </div>
  );

  return (
    <>
      {childWithProps}
      {portalContainer
        ? createPortal(modalContent, portalContainer)
        : modalContent}
    </>
  );
}
