import type { CandlestickData } from "lightweight-charts";

export function getSMASeriesData(data: CandlestickData[], periods: number) {
  const maData = [];

  for (let i = 0; i < data.length; i++) {
    if (i < periods) {
      // Provide whitespace data points until the MA can be calculated
      maData.push({ time: data[i].time });
    } else {
      // Calculate the moving average, slow but simple way
      let sum = 0;
      for (let j = 0; j < periods; j++) {
        sum += data[i - j].close;
      }
      const maValue = sum / periods;
      maData.push({ time: data[i].time, value: maValue });
    }
  }

  return maData;
}

export function getEMASeriesData(data: CandlestickData[], periods: number) {
  const emaData = [];
  const multiplier = 2 / (periods + 1);
  let previousEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < periods - 1) {
      // Provide whitespace data points until the EMA can be calculated
      emaData.push({ time: data[i].time });
    } else if (i === periods - 1) {
      // Initialize EMA with SMA of the first 'periods' values
      let sum = 0;
      for (let j = 0; j < periods; j++) {
        sum += data[i - j].close;
      }
      previousEMA = sum / periods;
      emaData.push({ time: data[i].time, value: previousEMA });
    } else {
      // Calculate EMA using the formula: EMA = (Close - Previous EMA) * Multiplier + Previous EMA
      const currentEMA: number =
        (data[i].close - previousEMA!) * multiplier + previousEMA!;
      previousEMA = currentEMA;
      emaData.push({ time: data[i].time, value: currentEMA });
    }
  }

  return emaData;
}

/**
 * Calculate EMA from an array of values (not CandlestickData)
 */
export function calculateEMAFromValues(
  values: number[],
  periods: number
): (number | null)[] {
  const emaData: (number | null)[] = [];
  const multiplier = 2 / (periods + 1);
  let previousEMA: number | null = null;

  for (let i = 0; i < values.length; i++) {
    if (i < periods - 1) {
      emaData.push(null);
    } else if (i === periods - 1) {
      // Initialize EMA with SMA of the first 'periods' values
      let sum = 0;
      for (let j = 0; j < periods; j++) {
        sum += values[i - j];
      }
      previousEMA = sum / periods;
      emaData.push(previousEMA);
    } else {
      // Calculate EMA
      const currentEMA: number =
        (values[i] - previousEMA!) * multiplier + previousEMA!;
      previousEMA = currentEMA;
      emaData.push(currentEMA);
    }
  }

  return emaData;
}

export interface MACDResult {
  macdLine: { time: CandlestickData["time"]; value?: number }[];
  signalLine: { time: CandlestickData["time"]; value?: number }[];
  histogram: {
    time: CandlestickData["time"];
    value?: number;
    color?: string;
  }[];
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param data - Candlestick data
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line EMA period (default: 9)
 * @param positiveColor - Color for positive histogram bars (default: green)
 * @param negativeColor - Color for negative histogram bars (default: red)
 */
export function getMACDSeriesData(
  data: CandlestickData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
  positiveColor: string = "rgba(34, 197, 94, 0.5)",
  negativeColor: string = "rgba(239, 68, 68, 0.5)"
): MACDResult {
  // Calculate fast and slow EMAs
  const fastEMA = getEMASeriesData(data, fastPeriod);
  const slowEMA = getEMASeriesData(data, slowPeriod);

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: { time: CandlestickData["time"]; value?: number }[] = [];
  const macdValues: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const fastValue = fastEMA[i].value;
    const slowValue = slowEMA[i].value;

    if (fastValue !== undefined && slowValue !== undefined) {
      const macdValue = fastValue - slowValue;
      macdLine.push({ time: data[i].time, value: macdValue });
      macdValues.push(macdValue);
    } else {
      macdLine.push({ time: data[i].time });
      macdValues.push(0); // Placeholder for EMA calculation
    }
  }

  // Calculate signal line (EMA of MACD line)
  const signalEMA = calculateEMAFromValues(macdValues, signalPeriod);
  const signalLine: { time: CandlestickData["time"]; value?: number }[] = [];

  for (let i = 0; i < data.length; i++) {
    if (signalEMA[i] !== null) {
      signalLine.push({ time: data[i].time, value: signalEMA[i]! });
    } else {
      signalLine.push({ time: data[i].time });
    }
  }

  // Calculate histogram (MACD line - signal line)
  const histogram: {
    time: CandlestickData["time"];
    value?: number;
    color?: string;
  }[] = [];

  for (let i = 0; i < data.length; i++) {
    const macdValue = macdLine[i].value;
    const signalValue = signalLine[i].value;

    if (macdValue !== undefined && signalValue !== undefined) {
      const histValue = macdValue - signalValue;
      histogram.push({
        time: data[i].time,
        value: histValue,
        color: histValue >= 0 ? positiveColor : negativeColor,
      });
    } else {
      histogram.push({ time: data[i].time });
    }
  }

  return {
    macdLine,
    signalLine,
    histogram,
  };
}
