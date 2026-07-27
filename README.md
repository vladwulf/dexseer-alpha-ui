# DexSeer Alpha UI

Crypto perpetual futures scanner & analytics dashboard. React + Vite + TypeScript + Tailwind v4.

## Commands

```bash
bun run dev          # Start dev server (Vite)
bun run build        # Production build (Vite only, no typecheck)
bun run check        # Biome check (format + lint)
bun run format       # Biome format + safe fixes
bun run lint         # Biome check + lint --write
bun run typecheck    # tsc -b --pretty false (strict composite check, app + node configs)
bun run preview      # Preview production build
bun run api          # Start local klines API server (port 5555)
```

## Environment

```bash
VITE_API_URL=https://api.dexseer.com    # Production API
# VITE_API_URL=http://localhost:5555     # Local API server
```

Configured in `src/config/index.ts` as `API_URL`.

## Architecture

```
src/
  pages/           # Route-level page components
    assets/        # Asset detail page (/assets/:symbol)
    simulations/   # Long/backtest simulation pages
    v2/            # V2 scanner page
  features/        # Domain-scoped feature modules (each self-contained)
    v2/scanner/    # Next-gen real-time scanner (WebSocket, 10 presets)
    alerts-explorer/
    alerts-side-panel/
    analytics/
    chart/         # Standard, Mini, Micro, Alert, Index chart variants
    dashboard/
    faq/
    market-movers/
    screener/
    scrolling-banner/
  components/      # Shared UI
    layout/        # RootLayout, Navbar, Layout
    ui/            # shadcn-style Radix primitives (~13 components)
    shadcn-space/  # Marquee animations
  hooks/
    chart/         # useGetChart, useLiveChartSeries
  types/           # OHLCV, Asset, Alert, Pagination types
  config/          # App config (API_URL)
  lib/             # Utilities (cn, parseCandleTime)
  patterns/        # ABCD harmonic pattern detection
  uicapsule/       # ASCII art renderers (illuminati/sauron eye)
```

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard — market movers strip + screener table |
| `/analytics` | Analytics — volume, movers, distribution, BTC correlation, breakout hours, runners |
| `/assets/:symbol` | Asset Detail — full detail for a specific symbol |
| `/simulation` | Longs simulation / backtest |
| `/v2/scanner` | V2 Scanner — real-time perpetual futures scanner |

`/patterns` and `/chart` routes are commented out in the router.

## Key Features / Feature Modules

- **v2/scanner** — next-gen real-time scanner with 10 presets (Classic Rolling, Momentum Long/Short, Breakouts, Pullbacks, OI Expansion, Funding Extremes, Squeeze Candidates, BTC Decouplers, High RVOL), WebSocket live feed, responsive layout, asset detail side panel, momentum heatmap, market breadth strip, persisted config
- **screener** — v1 asset screener table with sorting/filtering
- **market-movers** — scrolling horizontal banner of top movers
- **alerts-explorer** — browse, filter, and inspect trading alerts with embedded charts
- **alerts-side-panel** — recent alerts side panel with backtest variant
- **analytics** — 6 widgets: volume heatmap, timeframe movers, performance distribution, BTC correlation, breakout hours, runners
- **chart** — StandardChart, MiniChart, MicroChart, AlertChart, IndexChart (all use `lightweight-charts`)
- **scrolling-banner** — animated ticker banner
- **patterns** — experimental ABCD harmonic pattern detection and visualization

## Tech Stack

- **React 19** + **React Router 7** + **TanStack Query 5** + **TanStack Table 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-driven via `@import "tailwindcss"`, no config file)
- **lightweight-charts v5** for all candlestick/line charts
- **shadcn/ui** style primitives in `src/components/ui/` (Radix: Accordion, Dialog, DropdownMenu, ScrollArea, Tooltip, Slot + cmdk)
- **Zustand** for persisted state management (scanner table config)
- **Socket.IO** for real-time WebSocket feed (v2 scanner live data)
- **Three.js / @react-three/fiber + drei** (3D rendering capabilities)
- **Biome** for formatting and linting (ESLint removed)
- **Class Variance Authority** + **clsx** + **tailwind-merge** for component styling
- **Axios** for HTTP requests
- **Lucide React** for icons
- **millify** for number abbreviation
- **trading-signals** for technical indicator calculations
- **Bun** as package manager and runtime for the klines API server
- **Vercel Analytics** for usage tracking

## Gotchas

- Tailwind v4: configured via `src/globals.css` / `src/index.css` using `@import "tailwindcss"`, not `tailwind.config.js`
- `bun.lock` present — use `bun install`, not `npm install`
- Biome replaces ESLint for both formatting and linting
- `bun run build` skips TypeScript checking (Vite build only); use `bun run typecheck` separately when needed
- API types live in `src/features/analytics/types.ts` and `src/types/`
- Package has `overrides` for `vite` (rolldown-vite) and `picomatch` — don't remove
