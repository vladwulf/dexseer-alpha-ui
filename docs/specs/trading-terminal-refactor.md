# Trading Terminal UI Refactor

## Problem

DexSeer has real-time scanner and asset-analysis capabilities, but the primary experience is visually framed as a conventional dashboard: content is centered and padded, panel density is low, and the active instrument context is not persistent. The product should instead feel like a professional crypto trading terminal that makes scanning, evaluating, and acting on opportunities fast.

## Behavior

The Scanner route becomes a desktop-first, viewport-filling terminal. A compact global header and live market ticker remain visible; the workspace below is a resizable, border-separated grid with a left scanner/watchlist area, a central active-asset analysis area, and a right inspector/action rail. A lower dock exposes context-specific data such as signals, activity, and alerts without navigating away.

On compact viewports, the workspace degrades to focused scanner and detail views; the inspector and lower dock open as sheets/drawers. Existing scanning, searching, sorting, preset selection, live feed, chart updates, and routes continue to work.

Loading, empty, and API-error states use the same panel shell and retain controls. Keyboard focus remains visible, controls retain accessible names, and data color is never the only signal for a status.

## Contract

No API, schema, authentication, authorization, or persisted scanner-state contract changes are required. New client-only layout preferences (panel sizes and dock state) may be persisted under a versioned local-storage key.

## Non-goals

- Building a custody wallet, swap/order-routing flow, order book, or execution engine.
- Copying Trojan or Padre branding, icons, or proprietary layout assets.
- Changing scanner ranking logic, market-data APIs, or alert semantics.
- Rebuilding secondary Intelligence, Opportunities, simulation, or legacy pages in the first increment.

## Open decisions

- Whether the right rail should contain an actual connected trading ticket once wallet/execution capabilities exist, or initially offer analysis actions only (alert, watchlist, open asset page).
- The final desktop minimum width and panel-resizing library choice. The recommended baseline is CSS Grid first, with a small resizable-panel dependency only if user-controlled splits are required.
