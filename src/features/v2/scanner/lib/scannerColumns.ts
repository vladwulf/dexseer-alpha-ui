export const SCANNER_COLUMN_GROUPS = [
  "Price & momentum",
  "Volume",
  "Positioning",
] as const;

export type ScannerColumnGroup = (typeof SCANNER_COLUMN_GROUPS)[number];

export type ScannerColumnDefinition = {
  id: string;
  label: string;
  group: ScannerColumnGroup;
  locked?: boolean;
};

export const SCANNER_COLUMNS: ScannerColumnDefinition[] = [
  { id: "symbol", label: "Symbol", group: "Price & momentum", locked: true },
  { id: "price", label: "Price", group: "Price & momentum" },
  { id: "change5m", label: "5m change", group: "Price & momentum" },
  { id: "change15m", label: "15m change", group: "Price & momentum" },
  { id: "change1h", label: "1h change", group: "Price & momentum" },
  { id: "change4h", label: "4h change", group: "Price & momentum" },
  { id: "change24h", label: "24h change", group: "Price & momentum" },
  { id: "volume1m", label: "Volume 1m", group: "Volume" },
  { id: "volume5m", label: "Volume 5m", group: "Volume" },
  { id: "volume15m", label: "Volume 15m", group: "Volume" },
  { id: "volume30m", label: "Volume 30m", group: "Volume" },
  { id: "volume1h", label: "Volume 1h", group: "Volume" },
  { id: "volume4h", label: "Volume 4h", group: "Volume" },
  { id: "volume", label: "Volume 24h", group: "Volume" },
  { id: "rvol1m", label: "RVOL 1m", group: "Volume" },
  { id: "rvol5m", label: "RVOL 5m", group: "Volume" },
  { id: "rvol15m", label: "RVOL 15m", group: "Volume" },
  { id: "rvol30m", label: "RVOL 30m", group: "Volume" },
  { id: "rvol1h", label: "RVOL 1h", group: "Volume" },
  { id: "rvol4h", label: "RVOL 4h", group: "Volume" },
  { id: "rvol", label: "RVOL 24h", group: "Volume" },
  { id: "openInterest", label: "Open interest", group: "Positioning" },
  { id: "oiDelta5m", label: "OI Δ 5m", group: "Positioning" },
  { id: "oiDelta15m", label: "OI Δ 15m", group: "Positioning" },
  { id: "oiDelta30m", label: "OI Δ 30m", group: "Positioning" },
  { id: "oiDelta1h", label: "OI Δ 1h", group: "Positioning" },
  { id: "oiDelta4h", label: "OI Δ 4h", group: "Positioning" },
  { id: "oiDelta", label: "OI Δ 24h", group: "Positioning" },
  { id: "funding", label: "Funding", group: "Positioning" },
  { id: "fundingDelta8h", label: "Funding Δ 8h", group: "Positioning" },
];

export const DEFAULT_SCANNER_COLUMN_ORDER = [
  "symbol",
  "price",
  "change5m",
  "change15m",
  "change1h",
  "change4h",
  "change24h",
  "volume",
  "rvol",
  "openInterest",
  "oiDelta",
  "funding",
];

const knownColumnIds = new Set(SCANNER_COLUMNS.map((column) => column.id));

export function normalizeScannerColumnOrder(value: unknown): string[] {
  const ids = Array.isArray(value)
    ? value.filter(
        (id): id is string => typeof id === "string" && knownColumnIds.has(id),
      )
    : [];
  const uniqueIds = [...new Set(ids)].filter((id) => id !== "symbol");

  return ["symbol", ...uniqueIds];
}
