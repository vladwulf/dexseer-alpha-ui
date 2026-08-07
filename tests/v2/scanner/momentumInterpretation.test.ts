import { describe, expect, test } from "bun:test";
import type { ScannerAsset } from "../../../src/features/v2/scanner/types";
import { interpretMomentum } from "../../../src/features/v2/scanner/lib/momentumInterpretation/interpretMomentum";

function asset(overrides: Partial<ScannerAsset> = {}): ScannerAsset {
  return {
    symbol: "TESTUSDT",
    market: "PERP",
    price: 100,
    change5m: 0.2,
    change15m: 0.6,
    change1h: 1.4,
    change4h: 3.2,
    change24h: 6.8,
    momentumScore: 64,
    momentumScoreCore: 61,
    momentumScoreCoverage: 1,
    momentumScoreConfirmedCoverage: 0.9,
    momentumScoreVersion: 1,
    volume: 50_000_000,
    rvol: 1.8,
    openInterest: 10_000_000,
    oiDelta: 8,
    funding: 0.0001,
    volume1m: null,
    volume5m: null,
    volume15m: null,
    volume30m: null,
    volume1h: null,
    volume4h: null,
    rvol1m: null,
    rvol5m: 1.4,
    rvol15m: 1.7,
    rvol30m: null,
    rvol1h: 1.8,
    rvol4h: 1.6,
    oiDelta5m: 0.5,
    oiDelta15m: 1.2,
    oiDelta30m: null,
    oiDelta1h: 3.4,
    oiDelta4h: 5.2,
    fundingDelta8h: 0,
    atrPercent: 4,
    btcCorrelation: 0.55,
    alertCount: 0,
    setupLabel: "Live scanner",
    setupScore: 64,
    rankingReason: "",
    activeSetupSummary: "",
    btcRelativeBehavior: "",
    sessionEdge: "",
    bestHours: [],
    sparkline: [],
    chart: [],
    recentAlerts: [],
    momentumIntelligence: {
      fiveMinutes: { state: "bullish_default", direction: "long" },
      fifteenMinutes: { state: "bullish_default", direction: "long" },
      oneHour: { state: "bullish_slow", direction: "long" },
    },
    ...overrides,
  };
}

describe("interpretMomentum", () => {
  test("describes aligned price, participation, and OI as a confirmed continuation", () => {
    const read = interpretMomentum(asset());

    expect(read.regime).toBe("continuation");
    expect(read.headline).toBe("Strong bullish continuation");
    expect(read.summary).toContain("multiple timeframes");
    expect(read.summary).toContain("new positions");
    expect(read.confidence).toBe("high");
  });

  test("distinguishes short covering from new-position expansion at the same score", () => {
    const read = interpretMomentum(
      asset({
        oiDelta1h: -3.1,
        oiDelta4h: -4.5,
        oiDelta: -7,
      }),
    );

    expect(read.regime).toBe("covering");
    expect(read.headline).toBe("Strong rally, mostly short covering");
    expect(read.summary).toContain("open interest is falling");
  });

  test("identifies a short-term pullback that remains aligned with the broader direction", () => {
    const read = interpretMomentum(
      asset({
        change5m: -0.4,
        change15m: -0.5,
        change1h: -0.8,
        change4h: 2.5,
        change24h: 8,
      }),
    );

    expect(read.regime).toBe("pullback");
    expect(read.headline).toBe("Strong bullish pullback");
    expect(read.summary).toContain("broader trend remains higher");
  });

  test("recognizes a shallow 15m pause inside a strong 24h move as a pullback", () => {
    const read = interpretMomentum(
      asset({
        momentumScore: 41,
        change5m: null,
        change15m: -0.22,
        change1h: -0.16,
        change4h: null,
        change24h: 16.95,
      }),
    );

    expect(read.regime).toBe("pullback");
    expect(read.headline).toBe("Developing bullish pullback");
  });

  test("calls out score and price divergence before positive participation", () => {
    const read = interpretMomentum(
      asset({
        change5m: -0.4,
        change15m: -0.7,
        change1h: -1.2,
        change4h: -2,
        change24h: -4,
      }),
    );

    expect(read.regime).toBe("divergence");
    expect(read.headline).toBe("Bullish score, weakening price");
    expect(read.summary).toContain("does not confirm");
  });

  test("uses a developing band below 45 and a moderate band from 45", () => {
    expect(interpretMomentum(asset({ momentumScore: 44 })).strength).toBe(
      "developing",
    );
    expect(interpretMomentum(asset({ momentumScore: 45 })).strength).toBe(
      "moderate",
    );
  });

  test("downgrades a directional read when coverage is partial", () => {
    const read = interpretMomentum(
      asset({
        momentumScoreCoverage: 0.55,
        momentumScoreConfirmedCoverage: 0.4,
      }),
    );

    expect(read.confidence).toBe("low");
    expect(read.drivers.some((driver) => driver.label === "Confidence")).toBe(
      true,
    );
  });

  test("treats missing metrics as unknown instead of neutral", () => {
    const read = interpretMomentum(
      asset({
        change5m: null,
        change15m: null,
        change1h: null,
        change4h: null,
        change24h: null,
        rvol: null,
        rvol5m: null,
        rvol15m: null,
        rvol1h: null,
        rvol4h: null,
        oiDelta: null,
        oiDelta5m: null,
        oiDelta15m: null,
        oiDelta1h: null,
        oiDelta4h: null,
        funding: null,
        fundingDelta8h: null,
        atrPercent: null,
        btcCorrelation: null,
        momentumIntelligence: undefined,
      }),
    );

    expect(read.regime).toBe("directional");
    expect(read.summary).toContain("Market confirmation is limited");
    expect(read.summary).not.toContain("balanced");
  });

  test("returns a forming state when the score is unavailable", () => {
    const read = interpretMomentum(asset({ momentumScore: null }));

    expect(read.regime).toBe("forming");
    expect(read.headline).toBe("Momentum is still forming");
    expect(read.tone).toBe("neutral");
    expect(read.confidence).toBe("low");
  });

  test("mirrors continuation language for bearish momentum", () => {
    const read = interpretMomentum(
      asset({
        momentumScore: -78,
        change5m: -0.3,
        change15m: -0.8,
        change1h: -1.7,
        change4h: -3.5,
        change24h: -7,
        oiDelta1h: 3.2,
        momentumIntelligence: {
          fiveMinutes: { state: "bearish_default", direction: "short" },
          fifteenMinutes: { state: "bearish_unusual", direction: "short" },
          oneHour: { state: "bearish_default", direction: "short" },
        },
      }),
    );

    expect(read.regime).toBe("continuation");
    expect(read.headline).toBe("Very strong bearish continuation");
    expect(read.summary).toContain("new positions");
  });

  test("flags a noisy read when choppiness is high and timeframes conflict", () => {
    const read = interpretMomentum(
      asset({
        momentumChoppiness: 68,
        change15m: 0.5,
        change1h: -0.8,
        change4h: 1.2,
        change24h: -2,
        momentumIntelligence: {
          fiveMinutes: { state: "bullish_default", direction: "long" },
          fifteenMinutes: { state: "bearish_default", direction: "short" },
          oneHour: { state: "neutral", direction: null },
        },
      }),
    );

    expect(read.regime).toBe("choppy");
    expect(read.headline).toBe("Strong bullish read, noisy structure");
  });

  test("ignores partial intelligence snapshots that have no state or direction", () => {
    const read = interpretMomentum(
      asset({
        momentumIntelligence: {
          fiveMinutes: { direction: null },
          fifteenMinutes: { state: "bullish_default", direction: "long" },
          oneHour: null,
        },
      }),
    );

    expect(read.regime).toBe("continuation");
  });

  test("warns when an otherwise strong continuation has weak participation", () => {
    const read = interpretMomentum(
      asset({
        rvol: 0.7,
        rvol5m: 0.6,
        rvol15m: 0.7,
        rvol1h: 0.65,
        rvol4h: 0.7,
        atrPercent: null,
      }),
    );

    expect(read.summary).toContain("Participation is light");
  });

  test("adds crowded funding risk without changing the observed direction", () => {
    const read = interpretMomentum(asset({ funding: 0.0005 }));

    expect(read.regime).toBe("continuation");
    expect(read.summary).toContain("crowded on the long side");
  });

  test("recognizes ATR extension and BTC-independent behavior when each is material", () => {
    const extended = interpretMomentum(
      asset({ change24h: 10, atrPercent: 4, funding: null }),
    );
    const independent = interpretMomentum(
      asset({ atrPercent: null, btcCorrelation: 0.1, funding: null }),
    );

    expect(extended.summary).toContain("stretched relative to ATR");
    expect(independent.summary).toContain("independently of BTC");
  });
});
