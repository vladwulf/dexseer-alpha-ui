# Context-Aware Momentum Read

## Problem

The Scanner side panel currently interprets momentum almost entirely from the
absolute momentum score. Scores from 40 through 69 therefore receive the same
narrative even when their price structure, participation, derivatives flow, or
signal quality are materially different. The repeated copy makes the read feel
generic and can hide important distinctions such as an aligned continuation, a
low-volume drift, short covering, a pullback inside a larger trend, or a crowded
late move.

## Behavior

The **Momentum read** remains a compact, deterministic explanation of the
selected asset. It uses the signed score to establish direction and strength,
then qualifies that read with the strongest available evidence from:

- 5m, 15m, 1h, 4h, and 24h price changes;
- 5m, 15m, 1h, 4h, and 24h open-interest changes;
- short-window and 24h relative volume;
- current funding and 8h funding change;
- score coverage and confirmed coverage;
- 5m, 15m, and 1h momentum-intelligence state;
- ATR-relative extension, BTC correlation, and choppiness when available.

The read has three semantic parts:

1. A short headline that combines direction, strength, and regime, such as
   **Strong bullish continuation**, **Developing rally, mostly short covering**,
   **Bullish score, weakening price**, or **Bearish pullback in a broader
   uptrend**.
2. A one- or two-sentence explanation naming the evidence that most strongly
   differentiates the setup.
3. Two or three compact driver rows for price structure, participation, and
   positioning/confidence. Rows omit unavailable inputs instead of inventing a
   neutral reading.

Score strength uses narrower bands so score changes remain visible without
allowing score alone to determine the narrative: balanced (0–14), tentative
(15–29), developing (30–44), moderate (45–59), strong (60–74), very strong
(75–89), and extreme (90–100). The same strength can produce different reads
based on context.

The interpreter recognizes at least these regimes in both bullish and bearish
directions:

- multi-timeframe continuation;
- fresh acceleration or breakout;
- pullback inside a broader trend;
- score/price divergence;
- participation-confirmed move;
- low-participation drift;
- new-position expansion (price and OI advancing together);
- covering/liquidation move (price advances while OI contracts, or vice versa);
- crowded positioning from extreme funding;
- ATR-relative extension or exhaustion risk;
- choppy or conflicting evidence;
- incomplete or low-confidence data.

Directionally tiny changes use timeframe-specific deadbands and count as flat,
so insignificant noise does not create false alignment. Thresholds and regime
priority are named constants and are documented beside the interpreter. The
interpreter chooses a primary regime first, then adds no more than two distinct
confirmations or caveats. It does not concatenate every available fact or repeat
the raw numbers already visible immediately below it.

If the momentum score is absent, the panel says that a directional score is
still forming and may summarize only clearly available context. If coverage is
partial or confirmed coverage is low, confidence is explicitly downgraded. A
missing metric is treated as unknown, not zero or balanced.

The copy describes observed market state, not a recommendation. It avoids
promises, trade instructions, and certainty language such as “will rise.”

## Contract

No server API change is required. The existing scanner list and asset-details
responses already expose the required fields, including
`momentum_intelligence` on asset details.

The client introduces an internal `MomentumRead` result with a stable shape:

- `headline`: concise regime label;
- `summary`: evidence-led explanatory copy;
- `tone`: positive, negative, or neutral;
- `confidence`: low, medium, or high;
- `drivers`: up to three labeled display values;
- `regime`: a machine-readable regime key used by tests and future analytics.

`ScannerAsset` gains a nullable domain representation of the three
momentum-intelligence snapshots. Existing nullable market fields remain
backward-compatible. ATR and BTC correlation are made nullable in the client
model so unavailable backend values cannot be mistaken for real zero values.

## Non-goals

- Changing how the backend calculates or ranks the momentum score.
- Calling an LLM or external service to write a summary.
- Producing entry, exit, stop-loss, leverage, or position-size advice.
- Adding new market-data vendors or historical backfills.
- Redesigning the rest of the side panel or scanner table.
- Claiming predictive accuracy; this feature explains the current observable
  state.

## Open decisions

The initial thresholds should be treated as product heuristics and validated
against a representative fixture set before release. If real distributions show
that funding, RVOL, OI, ATR, or deadband thresholds are poorly calibrated, they
can be adjusted in one constants module without changing the interpreter or UI
contract.
