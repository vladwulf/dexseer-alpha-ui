# DexSeer Alpha UI

Crypto market analytics & alerts dashboard. React + Vite + TypeScript + Tailwind v4.

## Commands

```bash
bun run dev          # Start dev server (Vite)
bun run build        # Production build
bun run check        # Biome check
bun run format       # Biome format + safe fixes
bun run lint         # Biome lint --write (+ bun check)
bun run preview      # Preview production build
bun run api          # Start local klines API server (port 5555)
```

## Environment

```bash
# VITE_API_URL=https://api.dexseer.com   # Production API
VITE_API_URL=http://localhost:5555   # Local API server
```

Configured in `src/config/index.ts` as `API_URL`.

## Architecture

```
src/
  pages/           # Route-level page components
  features/        # Domain-scoped feature modules (each self-contained)
  components/      # Shared UI (layout/, ui/ shadcn components)
  hooks/           # Shared React hooks
  types/           # Shared TypeScript types
  config/          # App config (API_URL)
  lib/             # Utilities (cn, etc.)
  patterns/        # ABCD pattern detection logic
  uicapsule/       # ASCII renderers (eye animations etc.)
```

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard — MarketMovers + ScreenerTable |
| `/alerts/explorer` | Alerts Explorer |
| `/analytics` | Analytics (distribution, runners, BTC correlation, etc.) |
| `/simulation` | Longs simulation |

`/patterns` and `/chart` routes are commented out.

## Key Features / Feature Modules

- **screener** — main token screener table on dashboard
- **market-movers** — scrolling banner of top movers
- **alerts-explorer** — browse and inspect alerts with charts
- **alerts-side-panel** — alert performance + backtest
- **analytics** — AnalyticsRunners, PerformanceDistribution, BtcCorrelation, BreakoutHours, Volume, TimeframeMovers
- **chart** — MiniChart, StandardChart, MicroChart, AlertChart, IndexChart (all use `lightweight-charts`)

## Tech Stack

- **React 19** + **React Router 7** + **TanStack Query 5** + **TanStack Table 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite` — no config file, uses CSS imports)
- **lightweight-charts v5** for all candlestick/line charts
- **shadcn/ui** components in `src/components/ui/` (Radix primitives)
- **Bun** as package manager and runtime for the API server

## Gotchas

- Tailwind v4: configured via `src/globals.css` / `src/index.css` using `@import "tailwindcss"`, not `tailwind.config.js`
- `bun.lock` present — use `bun install`, not `npm install`
- ESLint has been removed; formatting and linting use Biome via Bun scripts
- `tsc -b` is skipped in the main `build` script (uses `build:old` for type-checked builds)
- API types live in `src/features/analytics/types.ts` and `src/types/`

## Behavioral Guidelines

These rules apply to every task unless explicitly overridden. Bias: caution over speed on non-trivial work. For trivial tasks, use judgment.

**Rule 1 — Think Before Coding.** State assumptions explicitly. If uncertain, ask rather than guess. Present multiple interpretations when ambiguity exists. Push back when a simpler approach exists. Stop when confused — name what's unclear.

**Rule 2 — Simplicity First.** Minimum code that solves the problem. Nothing speculative. No features beyond what was asked. No abstractions for single-use code. Test: would a senior engineer say this is overcomplicated? If yes, simplify.

**Rule 3 — Surgical Changes.** Touch only what you must. Clean up only your own mess. Don't "improve" adjacent code, comments, or formatting. Don't refactor what isn't broken. Match existing style. If you notice unrelated dead code, mention it — don't delete it.

**Rule 3a — No Explicit `any`.** Do not leave explicit `any` types in the codebase. Use precise types, `unknown`, discriminated unions, or small test-only helper types instead.

**Rule 4 — Goal-Driven Execution.** Define success criteria. Loop until verified. Don't follow steps blindly — define success and iterate. Strong success criteria allow independent verification.

**Rule 5 — Use the model only for judgment calls.** Use AI for: classification, drafting, summarization, extraction. Do NOT use AI for: routing, retries, deterministic transforms. If code can answer, code answers.

**Rule 6 — Token budgets are not advisory.** Per-task: 4,000 tokens. Per-session: 30,000 tokens. If approaching budget, summarize and start fresh. Surface the breach — do not silently overrun.

**Rule 7 — Surface conflicts, don't average them.** If two patterns contradict, pick one (more recent / more tested). Explain why. Flag the other for cleanup. Don't blend conflicting patterns.

**Rule 8 — Read before you write.** Before adding code, read exports, immediate callers, shared utilities. "Looks orthogonal" is dangerous. If unsure why code is structured a certain way, ask.

**Rule 9 — Tests verify intent, not just behavior.** Tests must encode WHY behavior matters, not just WHAT it does. A test that can't fail when business logic changes is wrong.

**Rule 10 — Checkpoint after every significant step.** Summarize what was done, what's verified, what's left. Don't continue from a state you can't describe back. If you lose track, stop and restate.

**Rule 11 — Match the codebase's conventions, even if you disagree.** Conformance > taste inside the codebase. If you genuinely think a convention is harmful, surface it. Don't fork silently.

**Rule 12 — Fail loud.** "Completed" is wrong if anything was skipped silently. "Tests pass" is wrong if any were skipped. Default to surfacing uncertainty, not hiding it.
