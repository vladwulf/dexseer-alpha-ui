import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  LineSeries,
  type LogicalRange,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { parseCandleTime } from "@/lib/parseCandleTime";
import type { OHLCVExtended } from "@/types/ohlcv";
import { EMA_COLORS } from "./ema";
import { getEMASeriesData } from "./indicators";
import { normalizeChartData } from "./normalizeChartData";

const NO_EMA_PERIODS: readonly number[] = [];
const RIGHT_EDGE_PADDING_PX = 24;

export type ChartAlertMarker = {
  direction: string;
  kind: "momentum" | "pullback";
  time: string;
};

type ChartProps = {
  dataKey?: string | number;
  initialVisibleCandleCount?: number;
  interactive?: boolean;
  klines: OHLCVExtended[];
  resetViewKey?: string | number;
  upColor?: string;
  downColor?: string;
  emaPeriods?: readonly number[];
  hasMoreHistory?: boolean;
  isLoadingMoreHistory?: boolean;
  onLoadMoreHistory?: () => void;
  showVolume?: boolean;
  watermarkText?: string;
  alertMarkers?: ChartAlertMarker[];
};

export const IndexChart: React.FC<ChartProps> = (props) => {
  const {
    interactive = false,
    initialVisibleCandleCount,
    dataKey,
    klines,
    downColor,
    emaPeriods = NO_EMA_PERIODS,
    hasMoreHistory = false,
    isLoadingMoreHistory = false,
    onLoadMoreHistory,
    resetViewKey,
    showVolume = false,
    upColor,
    watermarkText,
    alertMarkers = [],
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const volumeSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const emaSeriesRefs = useRef<
    Map<number, ReturnType<ReturnType<typeof createChart>["addSeries"]>>
  >(new Map());
  const alertMarkersRef = useRef<ReturnType<
    typeof createSeriesMarkers<Time>
  > | null>(null);
  const currentDataKeyRef = useRef<string | number | undefined>(undefined);
  const currentResetViewKeyRef = useRef<string | number | undefined>(
    resetViewKey,
  );
  const firstCandleTimeRef = useRef<Time | null>(null);
  const chartDataLengthRef = useRef(0);
  const initialVisibleCandleCountRef = useRef(initialVisibleCandleCount);
  const hasMoreHistoryRef = useRef(hasMoreHistory);
  const isLoadingMoreHistoryRef = useRef(isLoadingMoreHistory);
  const onLoadMoreHistoryRef = useRef(onLoadMoreHistory);
  const hasRequestedMoreHistoryRef = useRef(false);
  const ignoreNextVisibleRangeChangeRef = useRef(false);
  const [enabledEmaPeriods, setEnabledEmaPeriods] = useState<Set<number>>(
    () => new Set(emaPeriods),
  );

  initialVisibleCandleCountRef.current = initialVisibleCandleCount;
  hasMoreHistoryRef.current = hasMoreHistory;
  isLoadingMoreHistoryRef.current = isLoadingMoreHistory;
  onLoadMoreHistoryRef.current = onLoadMoreHistory;

  useEffect(() => {
    setEnabledEmaPeriods(new Set(emaPeriods));
  }, [emaPeriods]);

  useEffect(() => {
    for (const [period, series] of emaSeriesRefs.current) {
      series.applyOptions({ visible: enabledEmaPeriods.has(period) });
    }
  }, [enabledEmaPeriods]);

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
        // Keep a consistent gap between the newest candle and price scale,
        // including when fitContent() is used for short timeframes.
        rightOffsetPixels: RIGHT_EDGE_PADDING_PX,
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
        axisPressedMouseMove: interactive ? { time: true, price: true } : false,
        axisDoubleClickReset: false,
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

    emaSeriesRefs.current = new Map(
      emaPeriods.map((period) => [
        period,
        chart.addSeries(LineSeries, {
          color: EMA_COLORS[period] ?? "#a3a3a3",
          lineWidth: 1,
          priceScaleId: "right",
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
        }),
      ]),
    );

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    alertMarkersRef.current = createSeriesMarkers(candlestickSeries, []);

    const handleVisibleRangeChange = (range: LogicalRange | null) => {
      if (ignoreNextVisibleRangeChangeRef.current) {
        ignoreNextVisibleRangeChangeRef.current = false;
        return;
      }

      if (!range || range.from > 10) {
        hasRequestedMoreHistoryRef.current = false;
        return;
      }

      if (
        !hasRequestedMoreHistoryRef.current &&
        hasMoreHistoryRef.current &&
        !isLoadingMoreHistoryRef.current
      ) {
        hasRequestedMoreHistoryRef.current = true;
        onLoadMoreHistoryRef.current?.();
      }
    };

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    const resetChartView = (event: MouseEvent) => {
      const container = chartContainerRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const isPriceScale =
        event.clientX >= bounds.right - chart.priceScale("right").width();
      const isTimeScale =
        event.clientY >= bounds.bottom - chart.timeScale().height();

      if (!isPriceScale && !isTimeScale) return;

      event.preventDefault();
      event.stopPropagation();
      chart.priceScale("right").applyOptions({ autoScale: true });

      const visibleCandleCount = initialVisibleCandleCountRef.current;
      if (
        visibleCandleCount &&
        chartDataLengthRef.current > visibleCandleCount
      ) {
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, chartDataLengthRef.current - visibleCandleCount),
          to: chartDataLengthRef.current - 1,
        });
      } else {
        chart.timeScale().fitContent();
      }
    };

    if (interactive) {
      chartContainerRef.current.addEventListener(
        "dblclick",
        resetChartView,
        true,
      );
    }

    // Cleanup
    return () => {
      chartContainerRef.current?.removeEventListener(
        "dblclick",
        resetChartView,
        true,
      );
      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      alertMarkersRef.current = null;
      emaSeriesRefs.current.clear();
      chart.remove();
    };
  }, [downColor, emaPeriods, interactive, showVolume, upColor]);

  useEffect(() => {
    const markerSeries = alertMarkersRef.current;
    if (!markerSeries || klines.length === 0) return;

    const candleTimes = klines
      .filter(
        (kline) =>
          kline.open != null &&
          kline.high != null &&
          kline.low != null &&
          kline.close != null,
      )
      .map((kline) => parseCandleTime(kline.time));

    const markers: SeriesMarker<Time>[] = alertMarkers
      .flatMap<SeriesMarker<Time>>((alert) => {
        const alertTime = parseCandleTime(alert.time);
        if (
          alertTime < candleTimes[0] ||
          alertTime > candleTimes[candleTimes.length - 1]
        ) {
          return [];
        }
        const candleTime = candleTimes.reduce<number | undefined>(
          (nearest, time) =>
            nearest === undefined ||
            Math.abs(time - alertTime) < Math.abs(nearest - alertTime)
              ? time
              : nearest,
          undefined,
        );
        if (candleTime === undefined) return [];

        const isPullback = alert.kind === "pullback";
        const isShort = alert.direction.toLowerCase().includes("short");
        return [
          {
            time: candleTime as Time,
            position: isPullback || !isShort ? "belowBar" : "aboveBar",
            color: isPullback ? "#4ca7f8" : "#ffae45",
            shape: isPullback ? "circle" : isShort ? "arrowDown" : "arrowUp",
          },
        ];
      })
      .sort((left, right) => Number(left.time) - Number(right.time));

    markerSeries.setMarkers(markers);
  }, [alertMarkers, klines]);

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
    const previousDataLength = chartDataLengthRef.current;
    const shouldResetView = currentResetViewKeyRef.current !== resetViewKey;
    const shouldResetData =
      currentDataKeyRef.current !== dataKey ||
      firstCandleTimeRef.current !== firstCandleTime ||
      shouldResetView;

    if (shouldResetData) {
      const isNewDataSet = currentDataKeyRef.current !== dataKey;
      const isHistoryPrepend =
        !isNewDataSet &&
        firstCandleTimeRef.current !== firstCandleTime &&
        chartData.length > previousDataLength;
      const visibleRange = isNewDataSet
        ? null
        : chart.timeScale().getVisibleLogicalRange();

      candlestickSeries.setData(chartData);
      volumeSeriesRef.current?.setData(volumeData);
      for (const period of emaPeriods) {
        emaSeriesRefs.current
          .get(period)
          ?.setData(getEMASeriesData(chartData, period));
      }
      if (
        shouldResetView &&
        initialVisibleCandleCount &&
        chartData.length > initialVisibleCandleCount
      ) {
        chart.timeScale().fitContent();
        ignoreNextVisibleRangeChangeRef.current = true;
        chart.timeScale().setVisibleLogicalRange({
          from: chartData.length - initialVisibleCandleCount,
          to: chartData.length - 1,
        });
      } else if (shouldResetView) {
        chart.timeScale().fitContent();
      } else if (visibleRange) {
        // Older history is inserted before existing bars, shifting every
        // logical index to the right. Preserve the candles the user was
        // viewing instead of restoring the old numerical range.
        const historyOffset = isHistoryPrepend
          ? chartData.length - previousDataLength
          : 0;
        chart.timeScale().setVisibleLogicalRange({
          from: visibleRange.from + historyOffset,
          to: visibleRange.to + historyOffset,
        });
      } else if (
        initialVisibleCandleCount &&
        chartData.length > initialVisibleCandleCount
      ) {
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, chartData.length - initialVisibleCandleCount),
          to: chartData.length - 1,
        });
      } else {
        chart.timeScale().fitContent();
      }
      currentDataKeyRef.current = dataKey;
      firstCandleTimeRef.current = firstCandleTime;
      currentResetViewKeyRef.current = resetViewKey;
      chartDataLengthRef.current = chartData.length;
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
    for (const period of emaPeriods) {
      const latestEma = getEMASeriesData(chartData, period).at(-1);
      if (latestEma) emaSeriesRefs.current.get(period)?.update(latestEma);
    }
    chartDataLengthRef.current = chartData.length;
  }, [dataKey, emaPeriods, initialVisibleCandleCount, klines, resetViewKey]);

  return (
    <div className="relative h-full w-full rounded-md bg-[#0e0e0e]">
      {watermarkText && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center overflow-hidden px-4"
        >
          <span className="select-none whitespace-nowrap font-[var(--font-display)] text-[clamp(2.5rem,11vw,5rem)] font-bold italic tracking-[-0.05em] text-white/[0.1]">
            {watermarkText}
          </span>
        </div>
      )}
      {emaPeriods.length > 0 && (
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-x-2.5 gap-y-1 rounded bg-black/55 px-2 py-1 font-[var(--font-mono)] text-[0.58rem] font-medium tabular-nums text-white/85 backdrop-blur-sm">
          {emaPeriods.map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={enabledEmaPeriods.has(period)}
              className={`flex cursor-pointer items-center gap-1 transition-opacity ${
                enabledEmaPeriods.has(period) ? "" : "opacity-35"
              }`}
              onClick={() => {
                setEnabledEmaPeriods((current) => {
                  const next = new Set(current);
                  if (next.has(period)) next.delete(period);
                  else next.add(period);
                  return next;
                });
              }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: EMA_COLORS[period] ?? "#a3a3a3" }}
              />
              EMA {period}
            </button>
          ))}
        </div>
      )}
      <div
        ref={chartContainerRef}
        className={`h-full w-full ${
          interactive
            ? "cursor-crosshair touch-pan-y active:cursor-grabbing"
            : ""
        }`}
      />
    </div>
  );
};
