import { useState } from "react";
import { Chart } from "./Chart";
import type { PatternPriceLine, CandleColorOverride } from "./Chart";
import { Button } from "@/components/ui/button";
import kLinesData from "../data/k-lines.json";
import { parseKLine, type KLine } from "@/patterns/types/binance.types";
import {
  detectAllBosSignals,
  detectAllPullbacks,
} from "../detection/primitives";

export function AbcdPattern() {
  const [showLevels, setShowLevels] = useState(false);

  // Load k-line data
  const klines = kLinesData as KLine[];
  const parsedKlines = klines.map((k) => parseKLine(k));

  // Calculate actual price range for reference
  const priceRange = klines.reduce(
    (acc, kline) => {
      const high = parseFloat(kline[2]);
      const low = parseFloat(kline[3]);
      return {
        min: Math.min(acc.min, low),
        max: Math.max(acc.max, high),
      };
    },
    { min: Infinity, max: -Infinity }
  );

  console.log("Price range:", priceRange);

  // Example: Add your own price lines here
  const customPriceLines: PatternPriceLine[] = showLevels
    ? [
        {
          price: 0.00935,
          color: "#ef4444",
          lineWidth: 2,
          lineStyle: 0,
          title: "Example A",
          axisLabelVisible: true,
        },
      ]
    : [];

  // Detect all BOS signals with cooldown
  const cooldownPeriod = 30; // Candles to wait before detecting next BOS
  const lookbackPeriod = 60; // Candles to look back for highest high
  const impulse = 0.002; // Minimum 0.2% break to filter noise (0 = any break)
  const highlightCandles = 5; // Number of candles to highlight after BOS

  console.log(`Detection settings:`, {
    cooldownPeriod,
    lookbackPeriod,
    impulse,
  });

  const bosSignals = detectAllBosSignals(
    parsedKlines,
    cooldownPeriod,
    lookbackPeriod,
    impulse
  );

  // Detect pullbacks after BOS
  const pullbackThreshold = 0.02; // 2% retracement from BOS high
  const maxBarsAfterBos = 50; // Look for pullback within 50 candles
  const pullbacks = detectAllPullbacks(
    parsedKlines,
    bosSignals,
    pullbackThreshold,
    maxBarsAfterBos
  );

  console.log(`BOS: ${bosSignals.length} events detected`, bosSignals);
  console.log(`Pullbacks: ${pullbacks.length} detected`, pullbacks);

  // Try with lower impulse to see if any BOS exist
  if (bosSignals.length === 0) {
    const testSignals = detectAllBosSignals(
      parsedKlines,
      cooldownPeriod,
      lookbackPeriod,
      0
    );
    console.log(`Test with impulse=0: ${testSignals.length} BOS found`);
  }

  // Create color overrides for BOS candles (highlight N consecutive candles)
  const bosColorOverrides: Array<CandleColorOverride> = [];
  bosSignals.forEach((bosSignal) => {
    for (let j = 0; j < highlightCandles; j++) {
      const highlightIndex = bosSignal.bosIndex + j;
      if (highlightIndex < parsedKlines.length) {
        bosColorOverrides.push({
          index: highlightIndex,
          color: "#8654fd", // Purple for BOS
          borderColor: "#8654fd",
          wickColor: "#8654fd",
        });
      }
    }
  });
  console.log("bosColorOverrides", bosColorOverrides);

  // Create color overrides for pullback candles (highlight N consecutive candles)
  const pullbackColorOverrides: Array<CandleColorOverride> = [];
  pullbacks.forEach((pullback) => {
    for (let j = 0; j < highlightCandles; j++) {
      const highlightIndex = pullback.pullbackIndex + j;
      if (highlightIndex < parsedKlines.length) {
        pullbackColorOverrides.push({
          index: highlightIndex,
          color: "#f59e0b", // Amber for pullback
          borderColor: "#f59e0b",
          wickColor: "#f59e0b",
        });
      }
    }
  });

  console.log("Custom price lines:", customPriceLines);

  // // Detect BOS (Break of Structure) signals
  // const bosStartIndex = detectBosStart(parsedKlines);

  // const bosSignals: CandleColorOverride[] = [];
  // if (bosStartIndex >= 0) {
  //   bosSignals.push({
  //     index: bosStartIndex,
  //     color: "#8b5cf6",
  //     borderColor: "#8b5cf6",
  //     wickColor: "#8b5cf6",
  //   });
  // }

  // console.log(`BOS signal at index: ${bosStartIndex}`);

  // Combine all color overrides
  const candleColorOverrides: CandleColorOverride[] = showLevels
    ? [...bosColorOverrides, ...pullbackColorOverrides]
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          ABCD Pattern Analysis
        </h1>
        <p className="text-muted-foreground">
          Chart with candlestick data - add your pattern detection here
        </p>
      </div>

      <div className="flex gap-3 items-center">
        <Button
          variant={showLevels ? "default" : "outline"}
          onClick={() => {
            console.log("Button clicked, current showLevels:", showLevels);
            setShowLevels(!showLevels);
          }}
        >
          {showLevels ? "Hide" : "Show"} Example Levels
        </Button>
        <span className="text-sm text-muted-foreground">
          State: {showLevels ? "ON" : "OFF"} | Lines: {customPriceLines.length}
        </span>
      </div>

      <Chart
        klines={klines}
        height={600}
        customPriceLines={customPriceLines}
        candleColorOverrides={candleColorOverrides}
        showDefaultLevels={false}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold mb-2">Usage</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            The chart component is ready. Add price lines by passing
            customPriceLines prop:
          </p>
          <pre className="bg-muted p-2 rounded mt-2 text-xs overflow-x-auto">
            {`const priceLines: PatternPriceLine[] = [
  {
    price: 0.00920,
    color: "#ef4444",
    lineWidth: 2,
    lineStyle: 0, // 0=Solid, 1=Dotted, 2=Dashed
    title: "Point A",
    axisLabelVisible: true,
  }
];

<Chart customPriceLines={priceLines} />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
