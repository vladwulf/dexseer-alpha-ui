/**
 * Binance K-line (candlestick) data format
 * @see https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
 */
export type KLine = [
  number, // 0: Open time (timestamp in ms)
  string, // 1: Open price
  string, // 2: High price
  string, // 3: Low price
  string, // 4: Close price
  string, // 5: Volume (base asset)
  number, // 6: Close time (timestamp in ms)
  string, // 7: Quote asset volume
  number, // 8: Number of trades
  string, // 9: Taker buy base asset volume
  string, // 10: Taker buy quote asset volume
  string // 11: Unused field (ignore)
];

/**
 * Parsed K-line with numeric values for easier calculations
 */
export interface ParsedKLine {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
}

/**
 * Helper to convert raw Binance K-line to parsed format
 */
export function parseKLine(kline: KLine): ParsedKLine {
  return {
    openTime: kline[0],
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
    closeTime: kline[6],
    quoteVolume: parseFloat(kline[7]),
    trades: kline[8],
    takerBuyBaseVolume: parseFloat(kline[9]),
    takerBuyQuoteVolume: parseFloat(kline[10]),
  };
}
