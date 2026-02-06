import path from "path";
import allAssets from "./all-assets.json";
import fs from "fs";

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

enum Interval {
  ONE_MINUTE = "1m",
  FIVE_MINUTES = "5m",
  FIFTEEN_MINUTES = "15m",
  ONE_HOUR = "1h",
  TWO_HOURS = "2h",
  FOUR_HOURS = "4h",
  ONE_DAY = "1d",
}

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//?endTime=1764383226769&limit=1000&interval=1m&pair=MERLUSDT&contractType=PERPETUAL
const API_URL = "https://www.binance.com/fapi/v1/continuousKlines";

function getAPIURL(asset: string, endTime: number, interval: Interval) {
  return `${API_URL}?endTime=${endTime}&limit=1000&interval=${interval}&pair=${asset}&contractType=PERPETUAL`;
}

async function loadDataFromBinance(apiUrl: string) {
  const response = await fetch(apiUrl);
  return response.json();
}

async function loadExistingAssets() {
  const existingAssets = fs.readFileSync(
    path.join(import.meta.dir, "computed", "assets-timeseries-2-3.json"),
    "utf8"
  );
  return JSON.parse(existingAssets);
}

const initTime = Date.now();

async function main() {
  const existingAssets = await loadExistingAssets();

  const assetsTimeseriesMap = new Map<string, ParsedKLine[]>();
  for (const [asset, timeseries] of Object.entries(existingAssets) as [
    string,
    ParsedKLine[]
  ][]) {
    assetsTimeseriesMap.set(asset, timeseries);
  }

  const startFromAsset = "ZKCUSDT";
  const startFromIndex = allAssets.indexOf(startFromAsset);

  for (let i = startFromIndex; i < allAssets.length; i++) {
    console.log(`Processing asset ${i} of ${allAssets.length}`);
    const asset = allAssets[i];
    console.log(`Loading data for ${asset}`);
    let endTime = initTime;

    let timeseries: ParsedKLine[] = [];

    for (let i = 1; i <= 30; i++) {
      console.log(`Chunk ${i}...`);
      const apiUrl = getAPIURL(asset, endTime, Interval.ONE_MINUTE);
      console.log(`API URL: ${apiUrl}`);
      const data = await loadDataFromBinance(apiUrl);
      const klines: ParsedKLine[] = data.map((kline: KLine) =>
        parseKLine(kline)
      );
      console.log(`fetched ${klines.length} klines`);
      timeseries.push(...klines);
      endTime = klines[0].openTime;
    }

    timeseries.sort((a, b) => a.openTime - b.openTime);

    assetsTimeseriesMap.set(asset, timeseries);
    timeseries = [];
    fs.writeFileSync(
      path.join(import.meta.dir, "computed", "assets-timeseries-2-3.json"),
      JSON.stringify(Object.fromEntries(assetsTimeseriesMap))
    );
  }
}

main();
