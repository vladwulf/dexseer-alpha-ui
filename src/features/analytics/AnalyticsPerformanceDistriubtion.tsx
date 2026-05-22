import { useMemo, useState } from "react";
import { useGetPriceChangeDistribution } from "./hooks/analytics.api";
import type {
  AnalyticsDistributionAsset,
  AnalyticsDistributionBucketKey,
  AnalyticsDistributionMetric,
  AnalyticsDistributionResponse,
} from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DistributionRow = {
  key: AnalyticsDistributionBucketKey;
  label: string;
  displayLabel: string;
  side: "negative" | "neutral" | "positive";
  count: number;
  assets: AnalyticsDistributionAsset[];
};

const BUCKET_ORDER: { key: AnalyticsDistributionBucketKey; side: DistributionRow["side"]; displayLabel: string }[] = [
  { key: "ltNeg10", side: "negative", displayLabel: "<-10%" },
  { key: "fromNeg7to10", side: "negative", displayLabel: "-10% to -7%" },
  { key: "fromNeg5to7", side: "negative", displayLabel: "-7% to -5%" },
  { key: "fromNeg3to5", side: "negative", displayLabel: "-5% to -3%" },
  { key: "fromNeg0to3", side: "negative", displayLabel: "-3% to 0%" },
  { key: "zero", side: "neutral", displayLabel: "0%" },
  { key: "from0to3", side: "positive", displayLabel: "0% to 3%" },
  { key: "from3to5", side: "positive", displayLabel: "3% to 5%" },
  { key: "from5to7", side: "positive", displayLabel: "5% to 7%" },
  { key: "from7to10", side: "positive", displayLabel: "7% to 10%" },
  { key: "gt10", side: "positive", displayLabel: ">10%" },
];

const METRIC_OPTIONS: { value: AnalyticsDistributionMetric; label: string }[] = [
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

function formatPct(value: number, total: number) {
  if (!total) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function formatChange(asset: AnalyticsDistributionAsset, metric: AnalyticsDistributionMetric) {
  const metricFieldMap = {
    "15m": asset.change_15m,
    "30m": asset.change_30m,
    "1h": asset.change_1h,
    "4h": asset.change_4h,
    "1d": asset.change_1d,
  } satisfies Record<AnalyticsDistributionMetric, number | undefined>;
  const value = metricFieldMap[metric] ?? 0;
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : price < 100 ? 4 : 2,
  });
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "No snapshot";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

function getAssetChange(asset: AnalyticsDistributionAsset, metric: AnalyticsDistributionMetric) {
  if (metric === "15m") return asset.change_15m ?? 0;
  if (metric === "30m") return asset.change_30m ?? 0;
  if (metric === "1h") return asset.change_1h ?? 0;
  if (metric === "4h") return asset.change_4h ?? 0;
  return asset.change_1d ?? 0;
}

function sortAssetsByBucketSide(
  assets: AnalyticsDistributionAsset[],
  side: DistributionRow["side"],
  metric: AnalyticsDistributionMetric,
) {
  const sorted = [...assets];
  if (side === "negative") {
    sorted.sort((a, b) => getAssetChange(a, metric) - getAssetChange(b, metric));
  } else if (side === "positive") {
    sorted.sort((a, b) => getAssetChange(b, metric) - getAssetChange(a, metric));
  }
  return sorted;
}

function normalizeRows(data?: AnalyticsDistributionResponse): DistributionRow[] {
  if (!data) {
    return BUCKET_ORDER.map((bucket) => ({
      ...bucket,
      label: bucket.displayLabel,
      count: 0,
      assets: [],
    }));
  }

  return BUCKET_ORDER.map((bucket) => {
    const entry = data.buckets[bucket.key];
    return {
      ...bucket,
      label: entry?.label ?? bucket.displayLabel,
      count: entry?.count ?? 0,
      assets: entry?.assets ?? [],
    };
  });
}

export function AnalyticsPerformanceDistriubtion() {
  const [metric, setMetric] = useState<AnalyticsDistributionMetric>("1d");
  const [activeBucket, setActiveBucket] = useState<AnalyticsDistributionBucketKey | null>(null);
  const [hoveredBucket, setHoveredBucket] = useState<AnalyticsDistributionBucketKey | null>(null);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetPriceChangeDistribution(metric);

  const rows = useMemo(() => normalizeRows(data), [data]);
  const maxCount = Math.max(...rows.map((row) => row.count), 1);
  const selectedBucket = rows.find((row) => row.key === activeBucket) ?? null;
  const PAGE_SIZE = 20;

  const sortedSelectedAssets = useMemo(() => {
    if (!selectedBucket) return [];
    return sortAssetsByBucketSide(selectedBucket.assets, selectedBucket.side, metric);
  }, [selectedBucket, metric]);

  const totalPages = Math.max(1, Math.ceil(sortedSelectedAssets.length / PAGE_SIZE));
  const pagedSelectedAssets = sortedSelectedAssets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "oklch(0.96 0 0)",
            letterSpacing: "-0.01em",
            marginBottom: 4,
          }}
        >
          Movers Distribution
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            color: "oklch(0.42 0 0)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Price change distribution across screener movers
        </p>
      </div>

      <div
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(1 0 0 / 7%)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 12,
        }}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: String(data?.total ?? 0), tone: "oklch(0.96 0 0)" },
              { label: "Up", value: String(data?.priceUp ?? 0), tone: "oklch(0.72 0.18 142)" },
              { label: "Flat", value: String(data?.unchanged ?? 0), tone: "oklch(0.72 0.01 95)" },
              { label: "Down", value: String(data?.priceDown ?? 0), tone: "oklch(0.68 0.20 24)" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  minWidth: 92,
                  background: "oklch(0.13 0 0)",
                  border: "1px solid oklch(1 0 0 / 7%)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.42 0 0)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: isLoading ? "oklch(0.25 0 0)" : stat.tone,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={metric}
              onChange={(e) => {
                setMetric(e.target.value as AnalyticsDistributionMetric);
                setActiveBucket(null);
                setPage(1);
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                border: "1px solid oklch(0.72 0.18 248 / 35%)",
                borderRadius: 4,
                padding: "4px 10px",
                background: "oklch(0.72 0.18 248 / 8%)",
                color: "oklch(0.72 0.18 248)",
                outline: "none",
                appearance: "none",
                paddingRight: 24,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236ba3d6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {METRIC_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ background: "oklch(0.14 0 0)", color: "oklch(0.86 0 0)" }}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "oklch(0.42 0 0)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Updated {formatUpdatedAt(data?.updatedAt ?? null)} UTC
            </span>
          </div>
        </div>

        {isError ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 260,
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "oklch(0.35 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            Failed to load distribution
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 16,
                marginBottom: 12,
                padding: "0 8px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "oklch(0.58 0.16 24)",
                  textAlign: "right",
                }}
              >
                Negative
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "oklch(0.42 0 0)",
                }}
              >
                Bucket
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "oklch(0.58 0.16 142)",
                }}
              >
                Positive
              </div>
            </div>

            <div className="space-y-2">
              {rows.map((row) => {
                const width = `${(row.count / maxCount) * 100}%`;
                const isSelected = row.key === activeBucket;
                const isNeutral = row.side === "neutral";
                const isHovered = row.key === hoveredBucket;
                const tooltipAssets = sortAssetsByBucketSide(row.assets, row.side, metric).slice(0, 5);

                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => {
                      setActiveBucket((current) => (current === row.key ? null : row.key));
                      setPage(1);
                    }}
                    onMouseEnter={() => setHoveredBucket(row.key)}
                    onMouseLeave={() => setHoveredBucket((current) => (current === row.key ? null : current))}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: 16,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: isSelected ? "1px solid oklch(0.72 0.18 248 / 35%)" : "1px solid transparent",
                      background: isSelected ? "oklch(0.72 0.18 248 / 6%)" : "transparent",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      {row.side === "negative" && (
                        <div
                          style={{
                            width,
                            height: "100%",
                            borderRadius: 4,
                            background: "linear-gradient(270deg, oklch(0.68 0.20 24), oklch(0.34 0.10 24 / 40%))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            paddingLeft: 8,
                            minWidth: row.count > 0 ? 36 : 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.62rem",
                              color: "oklch(0.96 0 0)",
                            }}
                          >
                            {row.count}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        minWidth: 124,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          color: "oklch(0.88 0 0)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {row.displayLabel}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.56rem",
                          color: "oklch(0.42 0 0)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginTop: 2,
                        }}
                      >
                        {formatPct(row.count, data?.total ?? 0)} · {row.assets.length} assets
                      </div>
                    </div>

                    <div
                      style={{
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      {row.side === "positive" && (
                        <div
                          style={{
                            width,
                            height: "100%",
                            borderRadius: 4,
                            background: "linear-gradient(90deg, oklch(0.72 0.18 142), oklch(0.32 0.10 142 / 40%))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            paddingRight: 8,
                            minWidth: row.count > 0 ? 36 : 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.62rem",
                              color: "oklch(0.10 0 0)",
                              fontWeight: 700,
                            }}
                          >
                            {row.count}
                          </span>
                        </div>
                      )}
                      {isNeutral && (
                        <div
                          style={{
                            width: row.count > 0 ? "34%" : 0,
                            height: "100%",
                            borderRadius: 999,
                            background: "oklch(0.70 0.01 95 / 45%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: row.count > 0 ? 36 : 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.62rem",
                              color: "oklch(0.98 0 0)",
                            }}
                          >
                            {row.count}
                          </span>
                        </div>
                      )}
                    </div>

                    {isHovered && tooltipAssets.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, calc(-100% - 12px))",
                          minWidth: 220,
                          maxWidth: 280,
                          background: "oklch(0.10 0 0 / 96%)",
                          border: "1px solid oklch(1 0 0 / 10%)",
                          borderRadius: 10,
                          padding: "10px 12px",
                          boxShadow: "0 16px 40px oklch(0 0 0 / 35%)",
                          pointerEvents: "none",
                          zIndex: 10,
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.56rem",
                            color: "oklch(0.42 0 0)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          Top 5 In {row.displayLabel}
                        </div>
                        <div className="space-y-2">
                          {tooltipAssets.map((asset) => (
                            <div
                              key={`${row.key}-tooltip-${asset.asset_id}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.64rem",
                                  color: "oklch(0.94 0 0)",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {asset.symbol}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.6rem",
                                  color: formatChange(asset, metric).startsWith("+")
                                    ? "oklch(0.72 0.18 142)"
                                    : "oklch(0.68 0.20 24)",
                                }}
                              >
                                {formatChange(asset, metric)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedBucket && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "1px solid oklch(1 0 0 / 7%)",
                }}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "oklch(0.96 0 0)",
                      }}
                    >
                      Bucket Assets
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "oklch(0.42 0 0)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {selectedBucket.displayLabel} · {selectedBucket.count} assets
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBucket(null);
                      setPage(1);
                    }}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: 4,
                      padding: "4px 10px",
                      background: "transparent",
                      color: "oklch(0.48 0 0)",
                    }}
                  >
                    CLOSE
                  </button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSelectedAssets.length ? (
                      pagedSelectedAssets.map((asset) => (
                        <TableRow key={`${selectedBucket.key}-${asset.asset_id}`}>
                          <TableCell>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                                color: "oklch(0.92 0 0)",
                              }}
                            >
                              {asset.symbol}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span style={{ fontFamily: "var(--font-mono)", color: "oklch(0.88 0 0)" }}>
                              ${formatPrice(asset.price)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              style={{
                                  fontFamily: "var(--font-mono)",
                                  color: getAssetChange(asset, metric) >= 0
                                    ? "oklch(0.72 0.18 142)"
                                    : "oklch(0.68 0.20 24)",
                              }}
                            >
                              {formatChange(asset, metric)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <span style={{ fontFamily: "var(--font-mono)", color: "oklch(0.35 0 0)" }}>
                            No assets
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {sortedSelectedAssets.length > PAGE_SIZE && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "oklch(0.42 0 0)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sortedSelectedAssets.length)} of{" "}
                      {sortedSelectedAssets.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page === 1}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          cursor: page === 1 ? "default" : "pointer",
                          border: "1px solid oklch(1 0 0 / 10%)",
                          borderRadius: 4,
                          padding: "4px 10px",
                          background: "transparent",
                          color: page === 1 ? "oklch(0.28 0 0)" : "oklch(0.48 0 0)",
                        }}
                      >
                        PREV
                      </button>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "oklch(0.72 0.18 248)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        disabled={page === totalPages}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          cursor: page === totalPages ? "default" : "pointer",
                          border: "1px solid oklch(1 0 0 / 10%)",
                          borderRadius: 4,
                          padding: "4px 10px",
                          background: "transparent",
                          color: page === totalPages ? "oklch(0.28 0 0)" : "oklch(0.48 0 0)",
                        }}
                      >
                        NEXT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
