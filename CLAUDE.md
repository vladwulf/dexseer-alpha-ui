# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # Start Vite dev server
bun run build     # Production build (tsc + vite build)
bun run lint      # ESLint
bun run preview   # Preview production build
bun run api       # Run local Bun API server (src/data/klines-api-server.ts) on :5555
```

There are no test commands — this project has no test suite.

## Architecture

**DexSeer Alpha** is a client-side React 19 + TypeScript DEX analytics dashboard. It talks to a local Bun API server (`bun run api`) that serves OHLCV/kline data. The frontend URL is configured via `VITE_API_URL` (defaults to `http://localhost:5555`).

### Routing & Pages

React Router 7, routes defined in `src/App.tsx`:

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/alerts/explorer` | Alerts Explorer |
| `/patterns` | Patterns |
| `/chart` | Chart |
| `/simulation` | Simulations |

### Feature Modules (`src/features/`)

Each feature is self-contained with its own components, hooks, and API calls:

- **screener** — asset table with multi-timeframe OHLCV data and sorting
- **alerts-explorer** — paginated infinite-scroll alert list
- **alerts-side-panel** — live alert feed sidebar
- **chart** — candlestick chart with pattern overlays
- **dashboard** — landing page composition
- **market-movers** — top gainers/losers
- **scrolling-banner** — ticker tape
- **faq** — static content

### Data Fetching

All server state uses **TanStack React Query** with **Axios** (`src/config/index.ts` exports the configured `axios` instance pointing at `API_URL`). API hooks live in `hooks/*.api.ts` or `hooks/use*.ts` inside each feature. Key patterns:

- `useGetAssets()` — screener assets, supports timeframe + sort params
- `useGetAlertsPaginated()` — infinite query for alerts explorer
- `useGetAlerts()` — flat alerts list for the side panel
- `useGetAlertChart()` — OHLCV for a specific alert's chart

### State Management

**Zustand** (v5) for client-side state. Stores are minimal; most state lives in React Query cache or component-local state.

### Charts

**lightweight-charts** (v5) is the primary charting library. Wrappers live in `src/features/chart/`. Three.js (`@react-three/fiber`) is available for 3D visualizations.

### UI Conventions

- **Tailwind CSS v4** with `@tailwindcss/vite`. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes.
- **Radix UI** primitives for accessible components (accordion, dialog, dropdown-menu, scroll-area).
- Shadcn-style components are in `src/components/shadcn-space/` and `src/components/ui/`.
- Path alias `@/` maps to `src/`.

### TypeScript

Strict mode is on: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`. The compiler will error on unused variables and parameters — clean these up rather than suppressing. React Compiler (Babel plugin) is enabled, so manual `useMemo`/`useCallback` are generally unnecessary.

## Behavioral Guidelines

These rules apply to every task unless explicitly overridden. Bias: caution over speed on non-trivial work. For trivial tasks, use judgment.

**Rule 1 — Think Before Coding.** State assumptions explicitly. If uncertain, ask rather than guess. Present multiple interpretations when ambiguity exists. Push back when a simpler approach exists. Stop when confused — name what's unclear.

**Rule 2 — Simplicity First.** Minimum code that solves the problem. Nothing speculative. No features beyond what was asked. No abstractions for single-use code. Test: would a senior engineer say this is overcomplicated? If yes, simplify.

**Rule 3 — Surgical Changes.** Touch only what you must. Clean up only your own mess. Don't "improve" adjacent code, comments, or formatting. Don't refactor what isn't broken. Match existing style. If you notice unrelated dead code, mention it — don't delete it.

**Rule 4 — Goal-Driven Execution.** Define success criteria. Loop until verified. Don't follow steps blindly — define success and iterate. Strong success criteria allow independent verification.

**Rule 5 — Use the model only for judgment calls.** Use AI for: classification, drafting, summarization, extraction. Do NOT use AI for: routing, retries, deterministic transforms. If code can answer, code answers.

**Rule 6 — Token budgets are not advisory.** Per-task: 4,000 tokens. Per-session: 30,000 tokens. If approaching budget, summarize and start fresh. Surface the breach — do not silently overrun.

**Rule 7 — Surface conflicts, don't average them.** If two patterns contradict, pick one (more recent / more tested). Explain why. Flag the other for cleanup. Don't blend conflicting patterns.

**Rule 8 — Read before you write.** Before adding code, read exports, immediate callers, shared utilities. "Looks orthogonal" is dangerous. If unsure why code is structured a certain way, ask.

**Rule 9 — Tests verify intent, not just behavior.** Tests must encode WHY behavior matters, not just WHAT it does. A test that can't fail when business logic changes is wrong.

**Rule 10 — Checkpoint after every significant step.** Summarize what was done, what's verified, what's left. Don't continue from a state you can't describe back. If you lose track, stop and restate.

**Rule 11 — Match the codebase's conventions, even if you disagree.** Conformance > taste inside the codebase. If you genuinely think a convention is harmful, surface it. Don't fork silently.

**Rule 12 — Fail loud.** "Completed" is wrong if anything was skipped silently. "Tests pass" is wrong if any were skipped. Default to surfacing uncertainty, not hiding it.
