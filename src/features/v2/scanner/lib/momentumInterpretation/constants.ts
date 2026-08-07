export const SCORE_BANDS = [
  { minimum: 90, label: "extreme" },
  { minimum: 75, label: "very strong" },
  { minimum: 60, label: "strong" },
  { minimum: 45, label: "moderate" },
  { minimum: 30, label: "developing" },
  { minimum: 15, label: "tentative" },
] as const;

export const PRICE_DEADBANDS = {
  change5m: 0.1,
  change15m: 0.2,
  change1h: 0.4,
  change4h: 0.8,
  change24h: 1.5,
} as const;

export const MOMENTUM_THRESHOLDS = {
  confirmedCoverageHigh: 0.8,
  confirmedCoverageLow: 0.6,
  coverageHigh: 1,
  coverageLow: 0.75,
  fundingCrowdedLong: 0.0003,
  fundingCrowdedShort: -0.0002,
  largeOiChange: 5,
  lowChoppiness: 38.2,
  highChoppiness: 61.8,
  meaningfulOiChange: 2,
  confirmingRvol: 1.25,
  lowRvol: 0.8,
} as const;
