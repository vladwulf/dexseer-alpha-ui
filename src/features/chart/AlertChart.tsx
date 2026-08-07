import type {
  CandlestickData,
  MouseEventParams,
  Time,
} from "lightweight-charts";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  LineStyle,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { THEME_CHANGE_EVENT } from "@/config/themes";
import { parseCandleTime } from "@/lib/parseCandleTime";
import type { OHLCVExtended } from "@/types/ohlcv";
import { CHART_EMA_PERIODS, EMA_COLORS } from "./ema";
import { getEMASeriesData } from "./indicators";
import { normalizeChartData } from "./normalizeChartData";

export type AlertChartActiveCandle = {
  candle: OHLCVExtended;
  timeDisplay: string;
};

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getTimeValue = (time: Time): number =>
  typeof time === "number" ? time : Number.NaN;

// Keep the newest candle clear of the price scale when an alert is near the
// end of the rendered range.
const RIGHT_EDGE_PADDING_BARS = 3;

function getChartTheme() {
  const styles = getComputedStyle(document.documentElement);

  return {
    background: styles.getPropertyValue("--ds-canvas-raised").trim(),
    textColor: styles.getPropertyValue("--ds-text-secondary").trim(),
  };
}

interface AlertChartProps {
  /**
   * Alert object containing the timestamp and candlestick series data
   */
  alertTime: string;
  alertPrice?: number;
  alertDirection?: string;
  extremeTime?: string;
  extremePrice?: number;
  highlightAlertCandle?: boolean;
  showAlertTimeMarker?: boolean;
  inferAlertTimeFromPrice?: boolean;
  series: OHLCVExtended[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
  showLegend?: boolean;
  /** Number of candles to show when the chart first opens. */
  initialVisibleCandleCount?: number;
  onActiveCandleChange?: (activeCandle: AlertChartActiveCandle) => void;
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
  alertTime,
  alertPrice,
  alertDirection,
  extremeTime,
  extremePrice,
  highlightAlertCandle = true,
  showAlertTimeMarker = true,
  inferAlertTimeFromPrice = false,
  series,
  upColor = "#5dc887", // Green for up candles
  downColor = "#e35561", // Red for down candles
  showLegend = true,
  initialVisibleCandleCount,
  onActiveCandleChange,
}: AlertChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const seriesRef = useRef(series);
  const legendRef = useRef<HTMLDivElement | null>(null);
  const dataByTimeRef = useRef<Map<number, OHLCVExtended>>(new Map());

  useEffect(() => {
    if (!chartContainerRef.current || !series || series.length === 0) return;

    const chartTheme = getChartTheme();
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: chartTheme.background },
        textColor: chartTheme.textColor,
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
        rightOffset: 2,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
          // return date.toLocaleTimeString("default", {
          //   hour: "2-digit",
          //   minute: "2-digit",
          //   hour12: false, // Use 24-hour format, set to true for 12-hour
          // });
        },
      },
      localization: {
        // This formats the crosshair tooltip time
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString("default", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        },
      },
      rightPriceScale: {
        visible: true, // Hide price scale
        borderVisible: false,
        scaleMargins: {
          top: 0.08,
          bottom: 0.15,
        },
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        mode: 0, // Disable crosshair
        vertLine: {
          visible: true,
        },
        horzLine: {
          visible: true,
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

    // Opportunity rows provide the entry price but not the alert timestamp. In
    // that case, anchor the entry marker to the first candle containing it.
    const alertPriceCandle =
      inferAlertTimeFromPrice &&
      alertPrice != null &&
      Number.isFinite(alertPrice)
        ? series.find(
            (candle) => candle.low <= alertPrice && candle.high >= alertPrice,
          )
        : undefined;
    const alertTimestampUnix = (
      alertPriceCandle
        ? parseCandleTime(alertPriceCandle.time)
        : parseCandleTime(alertTime)
    ) as Time;
    const extremeTimestampUnix = extremeTime
      ? (parseCandleTime(extremeTime) as Time)
      : undefined;

    const pivotTime: Time = (series
      .map((k) => Number(parseCandleTime(k.time)))
      .filter((t) => t <= Number(alertTimestampUnix))
      .pop() ?? Number(alertTimestampUnix)) as Time;

    // Map OHLC data to candlestick format with opacity variations
    const candlestickData: CandlestickData[] = normalizeChartData(
      series
        .filter(
          (kline) =>
            kline.open != null &&
            kline.high != null &&
            kline.low != null &&
            kline.close != null,
        )
        .map((kline) => {
          const time = parseCandleTime(kline.time) as Time;
          let candleColor: string | undefined;

          if (highlightAlertCandle && time === pivotTime) {
            candleColor = "#facc15";
          } else if (Number(time) >= Number(pivotTime)) {
            candleColor = kline.close > kline.open ? upColor : downColor;
          } else {
            const baseColor = kline.close > kline.open ? upColor : downColor;
            candleColor = hexToRgba(baseColor, 0.3);
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

    candlestickSeries.setData(candlestickData);

    for (const period of CHART_EMA_PERIODS) {
      const emaSeries = chart.addSeries(LineSeries, {
        color: EMA_COLORS[period],
        lineWidth: 1,
        priceScaleId: "right",
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
      });
      emaSeries.setData(getEMASeriesData(candlestickData, period));
    }

    const alertCandle = candlestickData.find(
      (candle) => candle.time === alertTimestampUnix,
    );
    const triggerPrice =
      alertPrice != null && Number.isFinite(alertPrice)
        ? alertPrice
        : alertCandle?.close;
    const extremeCandleTime =
      extremeTimestampUnix == null
        ? undefined
        : (series
            .map((k) => Number(parseCandleTime(k.time)))
            .filter((time) => time <= Number(extremeTimestampUnix))
            .pop() ?? Number(extremeTimestampUnix));

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
        top: 0.85,
        bottom: 0,
      },
    });

    const volumeData = series.map((kline) => {
      const time = parseCandleTime(kline.time) as Time;
      const isUp = kline.close >= kline.open;
      const baseColor = isUp ? upColor : downColor;

      let color = baseColor;
      if (time < pivotTime) {
        color = hexToRgba(baseColor, 0.3);
      }

      return {
        time,
        value: Number(kline.asset_volume) || 0,
        color,
      };
    });

    volumeSeries.setData(volumeData);

    candlestickSeries.applyOptions({
      lastValueVisible: false, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
    });

    // Remove all default price lines before adding the alert trigger line.
    const priceLines = candlestickSeries.priceLines();
    priceLines.forEach((priceLine) => {
      candlestickSeries.removePriceLine(priceLine);
    });

    const fmtPrice = (v: number) => {
      if (v < 0.001) return v.toFixed(8);
      if (v < 0.01) return v.toFixed(7);
      if (v < 1) return v.toFixed(6);
      return v.toFixed(2);
    };

    const alertCandleForMarker = candlestickData.find(
      (candle) => candle.time === pivotTime,
    );
    const isBullishAlert = alertDirection
      ? !/(short|bear|down)/i.test(alertDirection)
      : (alertCandleForMarker?.close ?? 0) >= (alertCandleForMarker?.open ?? 0);
    const alertMarkerPrice = isBullishAlert
      ? (alertCandleForMarker?.low ?? triggerPrice)
      : (alertCandleForMarker?.high ?? triggerPrice);
    let alertTriggerMarker: HTMLDivElement | null = null;
    let extremeTimeLine: HTMLDivElement | null = null;
    const extremePriceLine =
      extremePrice == null || !Number.isFinite(extremePrice)
        ? null
        : candlestickSeries.createPriceLine({
            price: extremePrice,
            color: "#a78bfa",
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: "best move",
          });

    const updateAlertOverlay = () => {
      if (!alertTriggerMarker || alertMarkerPrice == null) return;

      const timeCoordinate = chart.timeScale().timeToCoordinate(pivotTime);
      const priceCoordinate =
        candlestickSeries.priceToCoordinate(alertMarkerPrice);

      if (timeCoordinate == null || priceCoordinate == null) {
        alertTriggerMarker.style.display = "none";
        return;
      }

      alertTriggerMarker.style.display = "block";
      alertTriggerMarker.style.transform = `translate(${timeCoordinate}px, ${priceCoordinate + (isBullishAlert ? 6 : -14)}px) translateX(-50%)`;
    };

    const updateExtremeOverlay = () => {
      if (!extremeTimeLine || extremeCandleTime == null) return;
      const timeCoordinate = chart
        .timeScale()
        .timeToCoordinate(extremeCandleTime as Time);
      if (timeCoordinate == null) {
        extremeTimeLine.style.display = "none";
        return;
      }
      extremeTimeLine.style.display = "block";
      extremeTimeLine.style.transform = `translateX(${timeCoordinate}px)`;
    };

    if (triggerPrice != null && showAlertTimeMarker) {
      chartContainerRef.current
        .querySelectorAll("[data-alert-chart-trigger-marker]")
        .forEach((node) => {
          node.remove();
        });

      alertTriggerMarker = document.createElement("div");
      alertTriggerMarker.dataset.alertChartTriggerMarker = "true";
      alertTriggerMarker.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        ${isBullishAlert ? "border-bottom: 8px solid #3b82f6;" : "border-top: 8px solid #3b82f6;"}
        pointer-events: none;
        z-index: 9;
      `;
      chartContainerRef.current.appendChild(alertTriggerMarker);
    }

    if (extremeCandleTime != null) {
      extremeTimeLine = document.createElement("div");
      extremeTimeLine.dataset.alertChartExtreme = "true";
      extremeTimeLine.style.cssText = `
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 0;
        border-left: 2px dashed #a78bfa;
        opacity: 0.9;
        pointer-events: none;
        z-index: 8;
      `;
      chartContainerRef.current.appendChild(extremeTimeLine);
    }

    if (initialVisibleCandleCount != null) {
      const visibleCandles = Math.min(
        initialVisibleCandleCount,
        candlestickData.length,
      );
      const alertIndex = candlestickData.findIndex(
        (candle) => candle.time === pivotTime,
      );
      const centeredIndex = alertIndex >= 0 ? alertIndex : visibleCandles - 1;
      const startIndex = Math.min(
        Math.max(0, centeredIndex - Math.floor(visibleCandles / 2)),
        candlestickData.length - visibleCandles,
      );

      chart.timeScale().setVisibleLogicalRange({
        from: startIndex,
        to: startIndex + visibleCandles - 1,
      });
    } else {
      // Find the index of the alert candle
      const alertIndex = candlestickData.findIndex(
        (candle) => candle.time === alertTimestampUnix,
      );

      // Center the chart on the alert timestamp
      if (alertIndex >= 0 && candlestickData.length > 0) {
        // Calculate how many candles to show (approximately 60% of total, centered on alert)
        const totalCandles = candlestickData.length;
        const visibleCandles = Math.min(
          Math.floor(totalCandles * 0.6),
          totalCandles,
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

        // Use logical indexes so the right edge can extend beyond the final
        // candle. A time range cannot represent this empty space.
        chart.timeScale().setVisibleLogicalRange({
          from: startIndex,
          to: endIndex + RIGHT_EDGE_PADDING_BARS,
        });
      } else {
        // Fallback to fitContent if alert candle not found
        chart.timeScale().fitContent();
      }
    }

    chart.timeScale().subscribeVisibleTimeRangeChange(updateAlertOverlay);
    chart.timeScale().subscribeVisibleTimeRangeChange(updateExtremeOverlay);
    updateAlertOverlay();
    updateExtremeOverlay();

    // Build data lookup by Unix timestamp (seconds)
    const dataByTime = new Map<number, OHLCVExtended>();
    for (const kline of series) {
      const ts = parseCandleTime(kline.time) as number;
      dataByTime.set(ts, kline);
    }
    dataByTimeRef.current = dataByTime;

    chartContainerRef.current
      .querySelectorAll("[data-alert-chart-legend]")
      .forEach((node) => {
        node.remove();
      });

    let legend: HTMLDivElement | null = null;

    if (showLegend) {
      // Create legend element
      legend = document.createElement("div");
      legend.dataset.alertChartLegend = "true";
      legend.style.cssText = `
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 10;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 16px;
        font-weight: 300;
        color: #d1d5db;
        pointer-events: none;
        max-width: min(560px, calc(100% - 96px));
        padding: 2px 0;
      `;
      chartContainerRef.current.appendChild(legend);
      legendRef.current = legend;
    }

    const fmt = (v: number | null | undefined, d = 2) => {
      if (v == null) return "—";
      return v.toFixed(d);
    };

    const fmtVol = (v: number) => {
      if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
      if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
      if (v >= 1e3) return `${(v / 1e3).toFixed(2)}K`;
      return v.toFixed(2);
    };

    const fmtBool = (v: boolean | null | undefined) =>
      v ? "✓" : v === false ? "✗" : "—";

    const row =
      "display: grid; grid-template-columns: repeat(4, max-content); gap: 3px 10px; align-items: baseline; margin-bottom: 2px;";
    const wideRow =
      "display: grid; grid-template-columns: repeat(3, max-content); gap: 3px 12px; align-items: baseline; margin-bottom: 2px;";
    const label = "color: #9ca3af;";

    const getLegendHtml = (d: OHLCVExtended, timeDisplay: string) => `
      <div style="margin-bottom: 6px; font-size: 12px; color: #9ca3af;">
        ${timeDisplay}
      </div>
      <div style="${row}">
        <span><span style="${label}">O:</span> ${fmtPrice(d.open)}</span>
        <span><span style="${label}">H:</span> <span style="color:${upColor}">${fmtPrice(d.high)}</span></span>
        <span><span style="${label}">L:</span> <span style="color:${downColor}">${fmtPrice(d.low)}</span></span>
        <span><span style="${label}">C:</span> <span style="font-weight:500">${fmtPrice(d.close)}</span></span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">Vol:</span> ${fmtVol(d.asset_volume)}</span>
        <span><span style="${label}">RelVol:</span> 1p:${fmt(d.rel_vol_1p, 1)}x</span>
        <span>16p:${fmt(d.rel_vol_16p, 1)}x</span>
        <span>96p:${fmt(d.rel_vol_96p, 1)}x</span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">EMA:</span> 9:${fmt(d.ema9, 4)}</span>
        <span>20:${fmt(d.ema20, 4)}</span>
        <span>50:${fmt(d.ema50, 4)}</span>
        <span>100:${fmt(d.ema100, 4)}</span>
        <span>200:${fmt(d.ema200, 4)}</span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">MACD:</span> L:${fmt(d.macd_line, 4)}</span>
        <span>S:${fmt(d.macd_signal, 4)}</span>
        <span>H:${fmt(d.macd_histogram, 4)}</span>
        <span><span style="${label}">Slp:</span> ${fmt(d.macd_signal_slope, 4)}</span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">ATR:</span> ${fmt(d.atr14, 4)}</span>
        <span><span style="${label}">ADX:</span> ${fmt(d.adx14, 1)}</span>
        <span><span style="${label}">Chop:</span> ${fmt(d.choppiness_index_14, 1)}</span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">RngZ:</span> ${fmt(d.range_z, 2)}</span>
        <span><span style="${label}">RVZ:</span> ${fmt(d.rvol_z_sustained, 2)}</span>
        <span><span style="${label}">MvZ:</span> ${fmt(d.move_z, 2)}</span>
      </div>
      <div style="${wideRow}">
        <span><span style="${label}">Brk:</span> 16p up:${fmtBool(d.is_16p_breakout)} dn:${fmtBool(d.is_16p_breakdown)}</span>
        <span>96p up:${fmtBool(d.is_96p_breakout)} dn:${fmtBool(d.is_96p_breakdown)}</span>
      </div>
    `;

    const updateLegend = (param: MouseEventParams | undefined) => {
      const validCrosshair = !(
        param === undefined ||
        param.time === undefined ||
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0
      );

      const candleBar = validCrosshair
        ? param?.seriesData.get(candlestickSeries)
        : null;

      const fallbackTime =
        candlestickData.find((candle) => candle.time === alertTimestampUnix)
          ?.time ?? candlestickData[candlestickData.length - 1]?.time;
      const timeRaw = candleBar?.time ?? fallbackTime;
      if (timeRaw == null) return;

      const timeNum = getTimeValue(timeRaw);
      if (!Number.isFinite(timeNum)) return;
      const d = dataByTimeRef.current.get(timeNum);

      if (!d) return;

      const timeDisplay = new Date(timeNum * 1000).toLocaleString("default", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      onActiveCandleChange?.({ candle: d, timeDisplay });

      if (legend) {
        legend.replaceChildren();
        legend.insertAdjacentHTML("afterbegin", getLegendHtml(d, timeDisplay));
      }
    };

    // Subscribe to crosshair move events
    chart.subscribeCrosshairMove(updateLegend);

    // Initialize legend with the last bar
    updateLegend(undefined);

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Cleanup
    return () => {
      chart.unsubscribeCrosshairMove(updateLegend);
      chart.timeScale().unsubscribeVisibleTimeRangeChange(updateAlertOverlay);
      chart.timeScale().unsubscribeVisibleTimeRangeChange(updateExtremeOverlay);
      if (extremePriceLine) {
        candlestickSeries.removePriceLine(extremePriceLine);
      }
      if (alertTriggerMarker?.parentNode) {
        alertTriggerMarker.parentNode.removeChild(alertTriggerMarker);
      }
      if (extremeTimeLine?.parentNode) {
        extremeTimeLine.parentNode.removeChild(extremeTimeLine);
      }
      if (legend?.parentNode) {
        legend.parentNode.removeChild(legend);
      }
      if (legendRef.current === legend) {
        legendRef.current = null;
      }
      dataByTimeRef.current = new Map();
      chart.remove();
    };
  }, [
    alertTime,
    series,
    upColor,
    downColor,
    alertPrice,
    alertDirection,
    extremeTime,
    extremePrice,
    highlightAlertCandle,
    showAlertTimeMarker,
    inferAlertTimeFromPrice,
    showLegend,
    initialVisibleCandleCount,
    onActiveCandleChange,
  ]);

  useEffect(() => {
    const updateChartTheme = () => {
      const chart = chartRef.current;
      if (!chart) return;

      const chartTheme = getChartTheme();
      chart.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: chartTheme.background },
          textColor: chartTheme.textColor,
        },
      });
    };

    window.addEventListener(THEME_CHANGE_EVENT, updateChartTheme);
    return () =>
      window.removeEventListener(THEME_CHANGE_EVENT, updateChartTheme);
  }, []);

  useEffect(() => {
    seriesRef.current = series;
  }, [series]);

  return (
    <div className="block h-full w-full min-w-0 overflow-hidden">
      <div
        ref={chartContainerRef}
        className="relative h-full w-full min-w-0 overflow-hidden"
      />
    </div>
  );
}
