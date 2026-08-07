# Scanner Column Customization

## Problem

The scanner has substantially more real-time data than its fixed table layout exposes. Traders cannot tailor the table to the signal they are investigating, so short-horizon volume, relative volume, open-interest changes, and funding detail are hidden or require a different experience.

## Behavior

The scanner toolbar includes a compact **Columns** control with a live count (for example, `Columns 11`). It opens a focused column customizer: a searchable, grouped list of available metrics on the left and an ordered **Visible columns** area on the right. Selecting a metric immediately adds it to the table; removing or reordering it immediately changes the table, without an Apply action. A lightweight **Reset to default** action restores the Classic Rolling baseline.

`Symbol` remains visible and first because it is the row identity and link target. On small viewports the same customizer is presented as a full-width bottom sheet; table scrolling remains horizontal and the setting itself is not forced into the table header. Null API values retain the current em dash treatment, so users may select a metric before every market-data source has populated it.

The available metrics are curated rather than showing raw API keys:

- **Price & momentum:** Price; 5m, 15m, 1h, 4h, and 24h change.
- **Volume:** 1m, 5m, 15m, 30m, 1h, 4h, and 24h volume; matching relative-volume windows.
- **Positioning:** Open interest; 5m, 15m, 30m, 1h, 4h, and 24h OI change; funding and 8h funding change.

The current Classic Rolling columns remain the default. A user can therefore begin with a familiar scanner and add, for example, `RVOL 15m`, `OI Δ 15m`, and `Volume 15m` to investigate the CARV-style burst without constructing a view from scratch.

## Contract

No server API contract changes. The persisted `scanner-v2-table-config` local-storage payload gains a versioned `columnOrder` field containing valid client column IDs. Old or malformed saved values are migrated to the current default. Unknown future IDs are ignored so a rollback cannot break loading an existing saved preference.

## Non-goals

- Saved/named views, cloud syncing, sharing layouts, or per-account persistence.
- Filtering or deriving new metrics; this feature only controls the display of fields already returned by the scanner API.
- Arbitrary computed columns, custom formulas, column widths, or a drag-and-drop dependency.
- Changing the scanner ranking or requesting fields not present in the existing response.

## Open decisions

None for the initial client-only release. The layout is one local preference for the V2 scanner, which matches the current screen's single Classic Rolling scanner mode. If presets become selectable in this screen later, layouts can be promoted to a per-preset map without changing the column registry or UI.
