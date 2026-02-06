import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  createSeriesMarkers,
} from "lightweight-charts";
import type {
  CandlestickData,
  Time,
  MouseEventParams,
} from "lightweight-charts";
import type { OHLCVExtended } from "@/types/ohlcv";
import { getEMASeriesData, getMACDSeriesData } from "./indicators";
import { MARibbonIndicator } from "./indicators/ma-ribbon-plugin";

interface ChartEvent {
  type: string;
  time: number;
  index: number;
}

interface MiniChartProps {
  klines: OHLCVExtended[];
  assetName?: string;
  width?: string;
  height?: string;
  upColor?: string;
  downColor?: string;
  upVolumeColor?: string;
  downVolumeColor?: string;
  events?: ChartEvent[];
}

function getAverageVolume(klines: OHLCVExtended[], loopbackPeriod: number) {
  const volume = klines
    .slice(-loopbackPeriod)
    .reduce((acc, kline) => acc + Number(kline.asset_volume), 0);
  return volume / loopbackPeriod;
}

export function StandardChart({
  klines,
  assetName,
  width = "100%",
  height = "100%",
  upColor = "#22c55e", // Default green for up candles
  downColor = "#ef4444", // Default red for down candles
  upVolumeColor = "#35883F", // Default green for up candles
  downVolumeColor = "#AB302B", // Default red for down candles
  events,
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof createChart>["addSeries"]
  > | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !klines || klines.length === 0) return;

    // Limit the number of periods to render
    const dataToRender = klines;

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
    const chartData: (CandlestickData & { volume: number })[] = dataToRender
      .map((kline) => {
        const timestamp = new Date(kline.time).getTime() / 1000;
        return {
          time: Math.floor(timestamp) as Time,
          open: Number(kline.open),
          high: Number(kline.high),
          low: Number(kline.low),
          close: Number(kline.close),
          volume: Number(kline.asset_volume),
        };
      })
      .sort((a, b) => (a.time as number) - (b.time as number)); // Ensure data is sorted by time

    if (events && events.length > 0) {
      createSeriesMarkers(
        candlestickSeries,
        events?.map((e) => {
          return {
            time: (e.time / 1000) as Time,
            position: "aboveBar",
            color: "#6be671",
            shape: "arrowDown",
            text: e.type,
          };
        })
      );
    }

    const ema9 = getEMASeriesData(chartData, 9);
    const ema20 = getEMASeriesData(chartData, 50);
    const macd = getMACDSeriesData(chartData);

    // Create MA ribbon between sma9 and sma20
    const ribbonPlugin = new MARibbonIndicator({
      fillColor: "rgba(100, 100, 100, 0.2)", // Default fallback color
      lineWidth: 0,
    });

    candlestickSeries.attachPrimitive(ribbonPlugin);

    // Prepare ribbon data with dynamic colors based on MA crossover and MACD
    const ribbonData = ema9
      .map((point9, index) => {
        const point20 = ema20[index];
        const macdHistogram = macd.histogram[index];

        if (!point20 || !point9.value || !point20.value) return null;

        const ema9Above = point9.value > point20.value;
        const macdPositive = macdHistogram.value && macdHistogram.value > 0;
        const macdNegative = macdHistogram.value && macdHistogram.value < 0;

        let color: string;

        if (ema9Above) {
          // EMA9 > EMA20: green if MACD positive, else gray
          color = macdPositive ? "#6be671" : "rgba(100, 100, 100, 0.2)";
        } else {
          // EMA9 < EMA20: red if MACD positive, else gray
          color = macdNegative ? "#FF244D" : "rgba(100, 100, 100, 0.2)";
        }

        return {
          time: point9.time,
          upper: point9.value,
          lower: point20.value,
          color, // Set color per timepoint
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    ribbonPlugin.setData(ribbonData);

    candlestickSeries.setData(chartData);
    candlestickSeries.applyOptions({
      // lastValueVisible: true, // hides the price on the right scale
      priceLineVisible: false, // hides the horizontal last price line
      // lastValueVisible: false,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
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
      chartData.map((kline) => ({
        time: kline.time,
        value: kline.volume,
        color: kline.close > kline.open ? upVolumeColor : downVolumeColor,
      }))
    );

    // Calculate relative volume data
    // Relative Volume = Current Volume / Average Volume (as a ratio)
    // This centers the oscillator at 1.0, where:
    // - 1.0 = average volume
    // - 2.0 = 2x average volume
    // - 0.5 = half of average volume
    const volumeMAPeriod = 96; // Period for volume moving average
    const relativeVolumeData = chartData.map((candle, i) => {
      // Calculate average volume up to this point
      let avgVolume = 0;
      if (i >= volumeMAPeriod) {
        const volumeSum = chartData
          .slice(i - volumeMAPeriod, i)
          .reduce((sum, c) => sum + c.volume, 0);
        avgVolume = volumeSum / volumeMAPeriod;
      } else if (i > 0) {
        // For early bars, use what we have
        const volumeSum = chartData
          .slice(0, i)
          .reduce((sum, c) => sum + c.volume, 0);
        avgVolume = volumeSum / i;
      } else {
        // First bar, use its own volume as average
        avgVolume = candle.volume;
      }

      // Calculate relative volume as a ratio
      const relativeVolume = avgVolume > 0 ? candle.volume / avgVolume : 1.0;

      // Color code based on value and price direction
      let color: string;
      const isGreen = candle.close > candle.open;

      if (relativeVolume > 2.0) {
        // Very high volume (2x or more above average)
        color = isGreen ? "#22c55e" : "#ef4444"; // Bright green or red
      } else {
        // Below average volume
        color = "rgba(100, 100, 100, 0.3)"; // Gray
      }

      return {
        time: candle.time,
        value: relativeVolume,
        color,
      };
    });

    // relativeVolumeHistogramSeries.setData(relativeVolumeData);

    const relativeMomentumOscillatorSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "price",
        precision: 2,
      },
      priceScaleId: "relativeMomentumOscillator", // Separate scale for relative momentum oscillator
    });

    // Configure the relative momentum oscillator scale position
    relativeMomentumOscillatorSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85, // Position at the bottom
        bottom: 0,
      },
    });

    /**
     * COMPOUND MOMENTUM INDICATOR
     * Combines multiple signals to produce a clear trading signal:
     * 1. Relative Volume >= 2.0x (filters for significant moves)
     * 2. Breakout: Current candle breaks 16-candle high/low (4h for 15m timeframe)
     * 3. MACD Momentum: Histogram open in direction of trend
     * 4. EMA Trend: EMA9 > EMA50 for bullish, EMA9 < EMA50 for bearish
     * 5. Volume Persistence >= 3 (sustained volume, not just a spike - avoids fakeouts)
     *
     * Signal strength: 0-5 (each condition adds 1 point)
     * Bullish signal: positive value
     * Bearish signal: negative value
     */
    const lookbackForBreakout = 16; // 16 candles = 4 hours on 15m timeframe

    const compoundSignalData = chartData.map((candle, i) => {
      // Initialize conditions
      let signalStrength = 0;

      // Skip early candles where we don't have enough data
      if (i < lookbackForBreakout) {
        return {
          time: candle.time,
          value: 0,
          color: "rgba(100, 100, 100, 0.2)",
        };
      }

      // 1. CHECK RELATIVE VOLUME >= 2.0x
      const relVol = relativeVolumeData[i]?.value || 0;
      const hasHighVolume = relVol >= 2;

      // 2. CHECK BREAKOUT (breaking 16-candle high/low)
      const lookbackCandles = chartData.slice(i - lookbackForBreakout, i);
      const highestHigh = Math.max(...lookbackCandles.map((c) => c.high));
      const lowestLow = Math.min(...lookbackCandles.map((c) => c.low));

      const breakingHigh = candle.high > highestHigh;
      const breakingLow = candle.low < lowestLow;

      // 3. CHECK MACD MOMENTUM
      const macdHist = macd.histogram[i]?.value || 0;
      const hasBullishMacd = macdHist > 0;
      const hasBearishMacd = macdHist < 0;

      // 4. CHECK EMA TREND DIRECTION
      const ema9Value = ema9[i]?.value || 0;
      const ema50Value = ema20[i]?.value || 0; // Using ema20 variable which is actually ema50
      const bullishTrend = ema9Value > ema50Value;
      const bearishTrend = ema9Value < ema50Value;

      // 5. CHECK VOLUME PERSISTENCE (>= 3 = strong sustained volume)
      // const volumePersistence = volumePersistenceData[i]?.value || 0;
      // const hasStrongPersistence = volumePersistence >= 3;

      // CALCULATE BULLISH SIGNAL
      if (breakingHigh && bullishTrend) {
        signalStrength = 1; // Base signal

        if (hasHighVolume) signalStrength += 1; // +1 for high volume
        if (hasBullishMacd) signalStrength += 1; // +1 for MACD confirmation
        // if (hasStrongPersistence) signalStrength += 1; // +1 for volume persistence

        // Bonus point if ALL primary conditions are met
        if (hasHighVolume && hasBullishMacd) signalStrength += 1;
      }

      // CALCULATE BEARISH SIGNAL
      if (breakingLow && bearishTrend) {
        signalStrength += 1; // Base signal (negative for bearish)

        if (hasHighVolume) signalStrength += 1; // +1 for high volume
        if (hasBearishMacd) signalStrength += 1; // +1 for MACD confirmation
        // if (hasStrongPersistence) signalStrength -= 1; // +1 for volume persistence

        // Bonus point if ALL primary conditions are met
        if (hasHighVolume && hasBearishMacd) signalStrength += 1;
      }

      // COLOR CODING based on signal strength
      let color: string;
      if (bullishTrend && signalStrength >= 4) {
        // Perfect bullish setup (all conditions met including bonus)
        // color = "#22c55e"; // Bright green
        color = "cyan";
      } else if (bearishTrend && signalStrength >= 4) {
        // color = "#ef4444"; // Bright red
        color = "cyan";
      } else {
        // No signal
        // color = "rgba(100, 100, 100, 0.1)"; // Almost transparent gray
        color = "transparent";
      }

      return {
        time: candle.time,
        value: signalStrength,
        color,
      };
    });

    relativeMomentumOscillatorSeries.setData(compoundSignalData);

    // Fit content to visible area
    chart.timeScale().fitContent();

    // Create and setup legend
    if (chartContainerRef.current && !legendRef.current) {
      const legend = document.createElement("div");
      legend.style.cssText = `
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 10;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 18px;
        font-weight: 300;
        color: #d1d5db;
        pointer-events: none;
      `;
      chartContainerRef.current.appendChild(legend);
      legendRef.current = legend;
    }

    // Helper functions for legend
    const formatPrice = (price: number) => {
      if (price < 0.001) return price.toFixed(8);
      if (price < 0.01) return price.toFixed(7);
      if (price < 1) return price.toFixed(6);
      return price.toFixed(2);
    };

    const getLastBar = () => {
      // Get the last bar from the chart data
      if (chartData.length === 0) return null;
      return chartData[chartData.length - 1];
    };

    const updateLegend = (param: MouseEventParams | undefined) => {
      if (!legendRef.current) return;

      const validCrosshairPoint = !(
        param === undefined ||
        param.time === undefined ||
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0
      );

      const bar = validCrosshairPoint
        ? param.seriesData.get(candlestickSeries)
        : getLastBar();

      if (!bar) return;

      // Type assertion for candlestick data
      const candleBar = bar as CandlestickData;

      const time = candleBar.time;
      const timeISO = new Date((time as number) * 1000).toLocaleString();
      const open = formatPrice(candleBar.open);
      const high = formatPrice(candleBar.high);
      const low = formatPrice(candleBar.low);
      const close = formatPrice(candleBar.close);

      // Find corresponding data for volume
      const barIndex = chartData.findIndex((d) => d.time === time);
      let volume = "";
      let avgVolume = "";
      let relativeVolume = "";
      let signalStrength = "";

      if (barIndex >= 0 && chartData[barIndex].volume !== undefined) {
        const vol = chartData[barIndex].volume;
        // Format volume with abbreviations (K, M, B)
        if (vol >= 1e9) {
          volume = (vol / 1e9).toFixed(2) + "B";
        } else if (vol >= 1e6) {
          volume = (vol / 1e6).toFixed(2) + "M";
        } else if (vol >= 1e3) {
          volume = (vol / 1e3).toFixed(2) + "K";
        } else {
          volume = vol.toFixed(2);
        }

        // Calculate and format average volume
        const avgVol = getAverageVolume(klines.slice(0, barIndex + 1), 10);
        if (avgVol >= 1e9) {
          avgVolume = (avgVol / 1e9).toFixed(2) + "B";
        } else if (avgVol >= 1e6) {
          avgVolume = (avgVol / 1e6).toFixed(2) + "M";
        } else if (avgVol >= 1e3) {
          avgVolume = (avgVol / 1e3).toFixed(2) + "K";
        } else {
          avgVolume = avgVol.toFixed(2);
        }

        // Calculate relative volume for current bar
        if (barIndex < relativeVolumeData.length) {
          const relVol = relativeVolumeData[barIndex].value;
          relativeVolume = `${relVol.toFixed(2)}x`;
        }

        // Calculate compound signal for current bar
        if (barIndex < compoundSignalData.length) {
          const signal = compoundSignalData[barIndex].value;
          signalStrength = signal.toFixed(0);
        }
      }

      legendRef.current.innerHTML = `
        ${
          assetName
            ? `<div style="margin-bottom: 8px; font-size: 16px; font-weight: 600;">
          ${assetName}
        </div>`
            : ""
        }
        <div style="margin-bottom: 8px; font-size: 14px; color: #9ca3af;">
          ${timeISO}
        </div>
        <div style="display: flex; gap: 16px; margin-bottom: 4px;">
          <span style="color: #9ca3af;">O:</span> <span>${open}</span>
          <span style="color: #9ca3af;">H:</span> <span style="color: ${upColor}">${high}</span>
          <span style="color: #9ca3af;">L:</span> <span style="color: ${downColor}">${low}</span>
          <span style="color: #9ca3af;">C:</span> <span style="font-weight: 500;">${close}</span>
        </div>
        ${
          volume
            ? `<div style="margin-top: 4px; display: flex; gap: 16px;">
          <span><span style="color: #9ca3af;">Volume:</span> <span>${volume}</span></span>
          ${
            avgVolume
              ? `<span><span style="color: #9ca3af;">Avg Vol (10):</span> <span style="color: rgba(59, 130, 246, 0.8);">${avgVolume}</span></span>`
              : ""
          }
          ${
            relativeVolume
              ? `<span><span style="color: #9ca3af;">Rel Vol:</span> <span style="color: ${
                  relativeVolumeData[barIndex]?.value > 2.0
                    ? "#22c55e"
                    : relativeVolumeData[barIndex]?.value > 1.0
                    ? "rgba(34, 197, 94, 0.8)"
                    : "#6b7280"
                }; font-weight: 600;">${relativeVolume}</span></span>`
              : ""
          }
        </div>`
            : ""
        }
        ${
          signalStrength
            ? `<div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <span style="color: #9ca3af;">Compound Signal:</span>
            <span style="color: ${
              Number(signalStrength) >= 5
                ? "#22c55e"
                : Number(signalStrength) >= 3
                ? "rgba(34, 197, 94, 0.7)"
                : Number(signalStrength) >= 1
                ? "rgba(34, 197, 94, 0.4)"
                : Number(signalStrength) <= -5
                ? "#ef4444"
                : Number(signalStrength) <= -3
                ? "rgba(239, 68, 68, 0.7)"
                : Number(signalStrength) <= -1
                ? "rgba(239, 68, 68, 0.4)"
                : "#6b7280"
            }; font-weight: 700; font-size: 16px;">${signalStrength}</span>
            <span style="font-size: 11px; color: #9ca3af;">${
              Number(signalStrength) >= 5
                ? "🟢 PERFECT SETUP"
                : Number(signalStrength) >= 3
                ? "🟢 Strong Signal"
                : Number(signalStrength) >= 1
                ? "🟡 Weak Signal"
                : Number(signalStrength) <= -5
                ? "🔴 PERFECT SETUP"
                : Number(signalStrength) <= -3
                ? "🔴 Strong Signal"
                : Number(signalStrength) <= -1
                ? "🟡 Weak Signal"
                : "⚪ No Signal"
            }</span>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #9ca3af;">
            Checks: Vol≥2.0x • 4h Breakout • MACD • EMA Trend • Vol Persistence≥3
          </div>
        </div>`
            : ""
        }
      `;
    };

    // Subscribe to crosshair move events
    chart.subscribeCrosshairMove(updateLegend);

    // Initialize legend with last bar
    updateLegend(undefined);

    // Store refs
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Store container ref for cleanup
    const container = chartContainerRef.current;
    const legend = legendRef.current;

    // Cleanup
    return () => {
      if (legend && container) {
        container.removeChild(legend);
        legendRef.current = null;
      }
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klines, width, height, upColor, downColor, assetName, events]);

  return (
    <div
      ref={chartContainerRef}
      className="rounded-md w-full h-full relative"
      style={{ width, height }}
    />
  );
}
