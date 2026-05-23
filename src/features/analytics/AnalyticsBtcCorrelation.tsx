import { useState } from "react";
import { useGetBtcCorrelation } from "./hooks/analytics.api";

const PERIODS = [7, 14, 30, 90] as const;
const PAGE_SIZE = 20;

function corrColor(r: number): string {
  if (r >= 0.7) return "oklch(0.72 0.18 248)";
  if (r >= 0.4) return "oklch(0.68 0.14 210)";
  if (r >= 0.1) return "oklch(0.52 0.06 220)";
  if (r >= -0.1) return "oklch(0.42 0 0)";
  return "oklch(0.72 0.18 60)";
}

function corrLabel(r: number): string {
  if (r >= 0.7) return "tracking";
  if (r >= 0.4) return "moderate";
  if (r >= 0.1) return "weak";
  if (r >= -0.1) return "neutral";
  return "decoupling";
}

export function AnalyticsBtcCorrelation() {
  const [lookbackDays, setLookbackDays] = useState<(typeof PERIODS)[number]>(7);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useGetBtcCorrelation({ lookbackDays });

  const sorted = [...(data?.assets ?? [])].sort((a, b) => {
    if (a.correlation === null) return 1;
    if (b.correlation === null) return -1;
    return b.correlation - a.correlation;
  });

  const filtered = search.trim()
    ? sorted.filter((a) =>
        a.symbol.toUpperCase().includes(search.trim().toUpperCase()),
      )
    : sorted;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <div style={{ marginBottom: 20, marginTop: 32 }}>
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
          BTC Correlation
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
          Return correlation vs BTC · {lookbackDays}d rolling window
        </p>
      </div>
      <div
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(1 0 0 / 7%)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
        className="sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div />
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.06em",
                background: "oklch(1 0 0 / 4%)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: 4,
                padding: "4px 10px",
                color: "oklch(0.72 0 0)",
                outline: "none",
                width: 100,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor =
                  "oklch(0.72 0.18 248 / 35%)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "oklch(1 0 0 / 10%)")
              }
            />
            {PERIODS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setLookbackDays(d);
                  setPage(0);
                }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  border: "1px solid",
                  borderRadius: 4,
                  padding: "4px 10px",
                  transition:
                    "color 0.15s, background 0.15s, border-color 0.15s",
                  background:
                    lookbackDays === d
                      ? "oklch(0.72 0.18 248 / 12%)"
                      : "transparent",
                  borderColor:
                    lookbackDays === d
                      ? "oklch(0.72 0.18 248 / 35%)"
                      : "oklch(1 0 0 / 10%)",
                  color:
                    lookbackDays === d
                      ? "oklch(0.72 0.18 248)"
                      : "oklch(0.48 0 0)",
                }}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "oklch(0.35 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            Failed to load · check API connection
          </div>
        ) : isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 8 }, (_, rowIndex) => rowIndex).map(
              (rowIndex) => (
                <div
                  key={`btc-correlation-skeleton-${rowIndex}`}
                  style={{
                    height: 28,
                    background: "oklch(1 0 0 / 4%)",
                    borderRadius: 4,
                    animation: "pulse 1.6s ease-in-out infinite",
                    animationDelay: `${rowIndex * 60}ms`,
                  }}
                />
              ),
            )}
          </div>
        ) : sorted.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "oklch(0.35 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            No data available
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div
              className="hidden sm:grid"
              style={{
                gridTemplateColumns: "3rem minmax(0, 1fr) 4rem 5rem 5rem",
                gap: 8,
                paddingBottom: 8,
                borderBottom: "1px solid oklch(1 0 0 / 6%)",
                marginBottom: 4,
              }}
            >
              {["#", "Asset", "r", "Signal", "Strength"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    color: "oklch(0.32 0 0)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {pageItems.map((asset, idx) => {
              const i = page * PAGE_SIZE + idx;
              const r = asset.correlation;
              const color = r !== null ? corrColor(r) : "oklch(0.32 0 0)";
              const label = r !== null ? corrLabel(r) : "—";
              const barWidth = r !== null ? Math.abs(r) * 100 : 0;
              const isNeg = r !== null && r < -0.1;

              return (
                <div
                  key={asset.symbol}
                  style={{ borderBottom: "1px solid oklch(1 0 0 / 4%)" }}
                >
                  <div className="sm:hidden" style={{ padding: "10px 0" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.58rem",
                              color: "oklch(0.30 0 0)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <span
                            className="min-w-0 truncate"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.65rem",
                              color: "oklch(0.72 0 0)",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div
                            style={{
                              height: 4,
                              background: "oklch(1 0 0 / 5%)",
                              borderRadius: 2,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                width: `${barWidth / 2}%`,
                                background: color,
                                borderRadius: 2,
                                ...(isNeg ? { right: "50%" } : { left: "50%" }),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {r === null
                            ? "—"
                            : `${r >= 0 ? "+" : ""}${r.toFixed(3)}`}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.54rem",
                            color,
                            letterSpacing: "0.06em",
                            padding: "2px 6px",
                            background: `${color.replace(")", " / 10%)")}`,
                            borderRadius: 3,
                            display: "inline-block",
                            marginTop: 6,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="hidden sm:grid"
                    style={{
                      gridTemplateColumns: "3rem minmax(0, 1fr) 4rem 5rem 5rem",
                      gap: 8,
                      alignItems: "center",
                      padding: "7px 0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "oklch(0.30 0 0)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="min-w-0 truncate"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "oklch(0.72 0 0)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {asset.symbol}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {r === null ? "—" : `${r >= 0 ? "+" : ""}${r.toFixed(3)}`}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.54rem",
                        color,
                        letterSpacing: "0.06em",
                        padding: "2px 6px",
                        background: `${color.replace(")", " / 10%)")}`,
                        borderRadius: 3,
                        display: "inline-block",
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        height: 4,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 2,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          width: `${barWidth / 2}%`,
                          background: color,
                          borderRadius: 2,
                          ...(isNeg ? { right: "50%" } : { left: "50%" }),
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="mt-3 flex items-center justify-between"
                style={{
                  paddingTop: 10,
                  borderTop: "1px solid oklch(1 0 0 / 6%)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.38 0 0)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {page * PAGE_SIZE + 1}–
                  {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      cursor: page === 0 ? "default" : "pointer",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: 4,
                      padding: "4px 12px",
                      background: "transparent",
                      color: page === 0 ? "oklch(0.28 0 0)" : "oklch(0.55 0 0)",
                      transition: "color 0.12s, border-color 0.12s",
                    }}
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.06em",
                      cursor: page >= totalPages - 1 ? "default" : "pointer",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: 4,
                      padding: "4px 12px",
                      background: "transparent",
                      color:
                        page >= totalPages - 1
                          ? "oklch(0.28 0 0)"
                          : "oklch(0.55 0 0)",
                      transition: "color 0.12s, border-color 0.12s",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div
              className="mt-4 flex flex-wrap items-center gap-4"
              style={{
                paddingTop: 12,
                borderTop: "1px solid oklch(1 0 0 / 6%)",
              }}
            >
              {[
                { label: "Tracking", color: "oklch(0.72 0.18 248)" },
                { label: "Moderate", color: "oklch(0.68 0.14 210)" },
                { label: "Weak", color: "oklch(0.52 0.06 220)" },
                { label: "Decoupling", color: "oklch(0.72 0.18 60)" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: "oklch(0.42 0 0)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
