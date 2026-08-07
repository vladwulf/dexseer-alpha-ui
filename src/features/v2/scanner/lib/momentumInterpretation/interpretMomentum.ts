import type {
  MomentumIntelligenceSnapshot,
  MomentumRead,
  MomentumStrength,
  ScannerAsset,
} from "../../types";
import { formatFundingRate, formatSigned } from "../formatters";
import { MOMENTUM_THRESHOLDS, PRICE_DEADBANDS, SCORE_BANDS } from "./constants";

type Direction = 1 | -1;
type Sign = Direction | 0;

type Metric = {
  label: string;
  value: number;
};

const PRICE_WINDOWS = [
  ["5m", "change5m"],
  ["15m", "change15m"],
  ["1h", "change1h"],
  ["4h", "change4h"],
  ["24h", "change24h"],
] as const;

const PRICE_DRIVER_WINDOWS = [
  ["15m", "change15m"],
  ["1h", "change1h"],
  ["24h", "change24h"],
] as const;

const RVOL_WINDOWS = [
  ["1h", "rvol1h"],
  ["15m", "rvol15m"],
  ["5m", "rvol5m"],
  ["4h", "rvol4h"],
  ["24h", "rvol"],
] as const;

const OI_WINDOWS = [
  ["1h", "oiDelta1h"],
  ["15m", "oiDelta15m"],
  ["4h", "oiDelta4h"],
  ["24h", "oiDelta"],
  ["5m", "oiDelta5m"],
] as const;

function getStrength(score: number): MomentumStrength {
  const absoluteScore = Math.min(Math.abs(score), 100);
  return (
    SCORE_BANDS.find((band) => absoluteScore >= band.minimum)?.label ??
    "balanced"
  );
}

function getSign(value: number | null, deadband: number): Sign | null {
  if (value === null) return null;
  if (Math.abs(value) < deadband) return 0;
  return value > 0 ? 1 : -1;
}

function getFirstMetric(
  asset: ScannerAsset,
  windows: readonly (readonly [string, keyof ScannerAsset])[],
): Metric | null {
  for (const [label, key] of windows) {
    const value = asset[key];
    if (typeof value === "number") return { label, value };
  }
  return null;
}

function getIntelligenceDirection(
  snapshot: MomentumIntelligenceSnapshot | null,
): Sign | null {
  if (!snapshot) return null;
  if (snapshot.direction === "long" || snapshot.state?.startsWith("bullish")) {
    return 1;
  }
  if (snapshot.direction === "short" || snapshot.state?.startsWith("bearish")) {
    return -1;
  }
  return 0;
}

function getConfidence(asset: ScannerAsset): MomentumRead["confidence"] {
  const coverage = asset.momentumScoreCoverage ?? null;
  const confirmed = asset.momentumScoreConfirmedCoverage ?? null;

  if (
    (coverage !== null && coverage < MOMENTUM_THRESHOLDS.coverageLow) ||
    (confirmed !== null && confirmed < MOMENTUM_THRESHOLDS.confirmedCoverageLow)
  ) {
    return "low";
  }

  if (
    coverage !== null &&
    coverage >= MOMENTUM_THRESHOLDS.coverageHigh &&
    confirmed !== null &&
    confirmed >= MOMENTUM_THRESHOLDS.confirmedCoverageHigh
  ) {
    return "high";
  }

  return "medium";
}

function formatPriceDriver(asset: ScannerAsset) {
  const values = PRICE_DRIVER_WINDOWS.map(([label, key]) => {
    const value = asset[key];
    return typeof value === "number" ? `${formatSigned(value)} ${label}` : null;
  }).filter((value): value is string => value !== null);

  return values.length > 0 ? values.join(" · ") : null;
}

function getDrivers(
  asset: ScannerAsset,
  confidence: MomentumRead["confidence"],
) {
  const drivers: MomentumRead["drivers"] = [];
  const price = formatPriceDriver(asset);
  const rvol = getFirstMetric(asset, RVOL_WINDOWS);
  const oi = getFirstMetric(asset, OI_WINDOWS);

  if (price) drivers.push({ label: "Price path", value: price });

  const participation = [
    rvol ? `${rvol.value.toFixed(1)}x RVOL ${rvol.label}` : null,
    oi ? `${formatSigned(oi.value)} OI ${oi.label}` : null,
  ].filter((value): value is string => value !== null);
  if (participation.length > 0) {
    drivers.push({ label: "Participation", value: participation.join(" · ") });
  }

  if (confidence === "low") {
    const confirmed = asset.momentumScoreConfirmedCoverage;
    const coverage = asset.momentumScoreCoverage;
    const values = [
      coverage === null || coverage === undefined
        ? null
        : `${Math.round(coverage * 100)}% coverage`,
      confirmed === null || confirmed === undefined
        ? null
        : `${Math.round(confirmed * 100)}% confirmed`,
    ].filter((value): value is string => value !== null);
    drivers.push({
      label: "Confidence",
      value: values.length > 0 ? values.join(" · ") : "Limited evidence",
    });
  } else if (asset.funding !== null) {
    const fundingChange =
      asset.fundingDelta8h === null
        ? ""
        : ` · ${formatFundingRate(asset.fundingDelta8h)} 8h Δ`;
    drivers.push({
      label: "Positioning",
      value: `${formatFundingRate(asset.funding)} funding${fundingChange}`,
    });
  }

  return drivers.slice(0, 3);
}

function getStructure(asset: ScannerAsset, direction: Direction) {
  const signs = Object.fromEntries(
    PRICE_WINDOWS.map(([label, key]) => [
      label,
      getSign(
        asset[key] as number | null,
        PRICE_DEADBANDS[key as keyof typeof PRICE_DEADBANDS],
      ),
    ]),
  ) as Record<(typeof PRICE_WINDOWS)[number][0], Sign | null>;
  const knownSigns = Object.values(signs).filter(
    (sign): sign is Sign => sign !== null,
  );
  const aligned = knownSigns.filter((sign) => sign === direction).length;
  const opposing = knownSigns.filter((sign) => sign === -direction).length;
  const shortOpposing =
    signs["15m"] === -direction &&
    (signs["1h"] === -direction || signs["1h"] === 0);
  const broaderAligned =
    signs["4h"] === direction || signs["24h"] === direction;
  const shortAligned = signs["15m"] === direction || signs["1h"] === direction;
  const broaderFlatOrOpposing =
    signs["4h"] !== direction && signs["24h"] !== direction;

  return {
    aligned,
    broaderAligned,
    hasPrice: knownSigns.length > 0,
    isAcceleration: shortAligned && broaderFlatOrOpposing,
    isContinuation: shortAligned && broaderAligned && aligned >= 3,
    isDivergence: !broaderAligned && (opposing >= 3 || shortOpposing),
    isPullback: shortOpposing && broaderAligned,
    opposing,
  };
}

function getIntelligenceConflict(asset: ScannerAsset) {
  const intelligence = asset.momentumIntelligence;
  if (!intelligence) return false;

  const directions = [
    getIntelligenceDirection(intelligence.fiveMinutes),
    getIntelligenceDirection(intelligence.fifteenMinutes),
    getIntelligenceDirection(intelligence.oneHour),
  ].filter((value): value is Sign => value !== null && value !== 0);

  return directions.includes(1) && directions.includes(-1);
}

export function interpretMomentum(asset: ScannerAsset): MomentumRead {
  const score = asset.momentumScore;
  const confidence = score === null ? "low" : getConfidence(asset);

  if (score === null) {
    return {
      headline: "Momentum is still forming",
      summary:
        "There is not enough fresh market activity for a reliable directional score yet.",
      tone: "neutral",
      confidence,
      drivers: getDrivers(asset, confidence),
      regime: "forming",
      strength: "balanced",
    };
  }

  const strength = getStrength(score);
  if (strength === "balanced") {
    return {
      headline: "Momentum is balanced",
      summary:
        "Buyers and sellers are offsetting each other, leaving no durable directional edge yet.",
      tone: "neutral",
      confidence,
      drivers: getDrivers(asset, confidence),
      regime: "balanced",
      strength,
    };
  }

  const direction: Direction = score > 0 ? 1 : -1;
  const bullish = direction === 1;
  const directionWord = bullish ? "bullish" : "bearish";
  const structure = getStructure(asset, direction);
  const oi = getFirstMetric(asset, OI_WINDOWS);
  const rvol = getFirstMetric(asset, RVOL_WINDOWS);
  const oiIsFalling =
    oi !== null && oi.value <= -MOMENTUM_THRESHOLDS.meaningfulOiChange;
  const oiIsGrowing =
    oi !== null && oi.value >= MOMENTUM_THRESHOLDS.meaningfulOiChange;
  const lowParticipation =
    rvol !== null && rvol.value < MOMENTUM_THRESHOLDS.lowRvol;
  const highParticipation =
    rvol !== null && rvol.value >= MOMENTUM_THRESHOLDS.confirmingRvol;
  const choppy =
    (asset.momentumChoppiness ?? 0) > MOMENTUM_THRESHOLDS.highChoppiness ||
    getIntelligenceConflict(asset);
  const confidenceCaveat =
    confidence === "low"
      ? " Confidence is limited by partial signal coverage."
      : "";
  const participationCaveat = lowParticipation
    ? " Participation is light, so follow-through is less convincing."
    : "";
  const newPositions = oiIsGrowing
    ? ", while rising open interest shows new positions joining the move"
    : "";
  const unavailableCaveat =
    !structure.hasPrice && !oi && !rvol
      ? " Market confirmation is limited because price, volume, and open-interest context are unavailable."
      : "";

  let regime: MomentumRead["regime"] = "directional";
  let headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${directionWord} momentum`;
  let summary = bullish
    ? "Buying pressure has the edge, but the surrounding market structure is not fully aligned yet."
    : "Selling pressure has the edge, but the surrounding market structure is not fully aligned yet.";

  if (structure.isDivergence) {
    regime = "divergence";
    headline = bullish
      ? "Bullish score, weakening price"
      : "Bearish score, strengthening price";
    summary = `The momentum score points ${bullish ? "higher" : "lower"}, but price action across the tracked windows does not confirm it.`;
  } else if (structure.isPullback) {
    regime = "pullback";
    headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${directionWord} pullback`;
    summary = bullish
      ? "Short-term price has cooled while the broader trend remains higher, which reads as a pullback rather than a full reversal."
      : "Short-term price has bounced while the broader trend remains lower, which reads as a pullback rather than a full reversal.";
  } else if (choppy) {
    regime = "choppy";
    headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${directionWord} read, noisy structure`;
    summary =
      "The directional score is meaningful, but choppiness or conflicting timeframe states reduce the quality of the trend.";
  } else if (oiIsFalling && structure.aligned >= 2) {
    regime = "covering";
    headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${bullish ? "rally, mostly short covering" : "selloff, mostly long liquidation"}`;
    summary = bullish
      ? "Price is advancing while open interest is falling, so short covering appears to be driving more of the move than fresh long demand."
      : "Price is falling while open interest is falling, so long liquidation appears to be driving more of the move than fresh short demand.";
  } else if (structure.isAcceleration) {
    regime = "acceleration";
    headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${directionWord} acceleration`;
    summary = `The move is strengthening in the shorter windows before the broader timeframes have fully caught up${newPositions}.`;
  } else if (structure.isContinuation) {
    regime = "continuation";
    headline = `${strength[0].toUpperCase()}${strength.slice(1)} ${directionWord} continuation`;
    summary = `Price direction is aligned across multiple timeframes${newPositions}.`;
  } else if (lowParticipation) {
    summary = `The score leans ${bullish ? "higher" : "lower"}, but relative volume is subdued and the move lacks broad participation.`;
  } else if (highParticipation) {
    summary = `The score leans ${bullish ? "higher" : "lower"}, with above-normal relative volume supporting the move${newPositions}.`;
  }

  const fundingCaveat =
    bullish &&
    asset.funding !== null &&
    asset.funding > MOMENTUM_THRESHOLDS.fundingCrowdedLong
      ? " Funding is crowded on the long side, raising reversal risk."
      : !bullish &&
          asset.funding !== null &&
          asset.funding < MOMENTUM_THRESHOLDS.fundingCrowdedShort
        ? " Funding is crowded on the short side, raising squeeze risk."
        : "";
  const extensionCaveat =
    asset.atrPercent !== null &&
    asset.atrPercent > 0 &&
    asset.change24h !== null &&
    Math.abs(asset.change24h) / asset.atrPercent >= 1.5 &&
    Math.sign(asset.change24h) === direction
      ? " The 24h move is stretched relative to ATR, so the setup may be late."
      : "";
  const btcContext =
    asset.btcCorrelation !== null && Math.abs(asset.btcCorrelation) < 0.2
      ? " The move is behaving largely independently of BTC."
      : asset.btcCorrelation !== null && Math.abs(asset.btcCorrelation) >= 0.75
        ? " The move is closely tied to BTC, rather than fully asset-specific."
        : "";

  return {
    headline,
    summary: `${summary}${
      fundingCaveat ||
      (regime === "directional" ? "" : participationCaveat) ||
      extensionCaveat ||
      confidenceCaveat ||
      unavailableCaveat ||
      btcContext
    }`,
    tone: bullish ? "positive" : "negative",
    confidence,
    drivers: getDrivers(asset, confidence),
    regime,
    strength,
  };
}
