import { millify } from "millify";
import { useState } from "react";
import { useGetHourlyVolumeActivity } from "./hooks/analytics.api";
import type {
  AnalyticsHourlyVolumeBucket,
  AnalyticsVolumeMetric,
} from "./types";

type HourlyData = {
  hour: number;
  volume: number;
  topAssets: { symbol: string; volume: number }[];
};

function normalizeBuckets(
  buckets: AnalyticsHourlyVolumeBucket[],
): HourlyData[] {
  const byHour = new Map(buckets.map((b) => [b.hour, b]));
  return Array.from({ length: 24 }, (_, hour) => {
    const bucket = byHour.get(hour);
    return {
      hour,
      volume: bucket?.totalVolume ?? 0,
      topAssets: (bucket?.assets ?? []).slice(0, 4).map((a) => ({
        symbol: a.symbol,
        volume: a.volume,
      })),
    };
  });
}

const SESSIONS = [
  { name: "Asia", start: 0, end: 9, hue: 300 },
  { name: "Europe", start: 7, end: 16, hue: 230 },
  { name: "US", start: 13, end: 22, hue: 50 },
];

const CHART_H = 220;
const AXIS_H = 28;

function padH(h: number) {
  return String(h).padStart(2, "0") + ":00";
}

function SkeletonBars() {
  // Approximate shape of a typical volume curve for the skeleton
  const heights = [
    14, 9, 7, 6, 8, 11, 17, 24, 36, 51, 64, 77, 81, 87, 100, 94, 91, 89, 84, 74,
    61, 47, 34, 21,
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: CHART_H,
        gap: 3,
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: "2px 2px 0 0",
            background: "oklch(1 0 0 / 5%)",
            animation: "pulse 1.6s ease-in-out infinite",
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

const LOOKBACK_OPTIONS = [7, 14, 30, 90] as const;

export function AnalyticsVolume() {
  const [metric, setMetric] = useState<AnalyticsVolumeMetric>("asset_volume");
  const [lookbackDays, setLookbackDays] =
    useState<(typeof LOOKBACK_OPTIONS)[number]>(7);
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const currentHour = new Date().getUTCHours();

  const { data, isLoading, isError } = useGetHourlyVolumeActivity({
    metric,
    lookbackDays,
  });

  const hourlyData: HourlyData[] = data ? normalizeBuckets(data.buckets) : [];

  const maxVol = hourlyData.length
    ? Math.max(...hourlyData.map((d) => d.volume))
    : 1;
  const totalVol = hourlyData.reduce((s, d) => s + d.volume, 0);
  const peak = hourlyData.length
    ? hourlyData.reduce((best, d) => (d.volume > best.volume ? d : best))
    : null;

  const assetTotals: Record<string, number> = {};
  for (const d of hourlyData) {
    for (const a of d.topAssets) {
      assetTotals[a.symbol] = (assetTotals[a.symbol] ?? 0) + a.volume;
    }
  }
  const sortedAssets = Object.entries(assetTotals).sort((a, b) => b[1] - a[1]);
  const topAsset = sortedAssets[0]?.[0] ?? "—";
  const maxAssetVol = sortedAssets[0]?.[1] ?? 1;
  const trackedAssets = sortedAssets.length;

  const activeData = activeHour !== null ? hourlyData[activeHour] : null;

  const tooltipTransform =
    activeHour !== null && activeHour > 19
      ? "translateX(-88%)"
      : activeHour !== null && activeHour < 4
        ? "translateX(-12%)"
        : "translateX(-50%)";

  const metricLabel = metric === "quote_volume" ? "Quote Vol" : "Asset Vol";

  return (
    <>
      <style>{`
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>

      <div style={{ padding: "32px 0 48px" }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "oklch(0.96 0 0)",
                letterSpacing: "-0.01em",
                marginBottom: 4,
              }}
            >
              Volume Analytics
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "oklch(0.42 0 0)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Aggregate DEX Activity · 24h UTC Window
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Metric toggle */}
            {(["quote_volume", "asset_volume"] as AnalyticsVolumeMetric[]).map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
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
                      metric === m
                        ? "oklch(0.72 0.18 248 / 12%)"
                        : "transparent",
                    borderColor:
                      metric === m
                        ? "oklch(0.72 0.18 248 / 35%)"
                        : "oklch(1 0 0 / 10%)",
                    color:
                      metric === m ? "oklch(0.72 0.18 248)" : "oklch(0.48 0 0)",
                  }}
                >
                  {m === "quote_volume" ? "QUOTE VOL" : "ASSET VOL"}
                </button>
              ),
            )}

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "oklch(0.72 0.18 248)",
                background: "oklch(0.72 0.18 248 / 8%)",
                border: "1px solid oklch(0.72 0.18 248 / 20%)",
                borderRadius: 4,
                padding: "4px 10px",
                letterSpacing: "0.08em",
              }}
            >
              NOW {padH(currentHour)} UTC
            </span>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "24h Volume",
              value:
                totalVol > 0 ? `$${millify(totalVol, { precision: 2 })}` : "—",
              sub: metricLabel,
            },
            {
              label: "Peak Hour",
              value: peak && peak.volume > 0 ? padH(peak.hour) : "—",
              sub:
                peak && peak.volume > 0
                  ? `$${millify(peak.volume)} UTC`
                  : "no data",
            },
            {
              label: "Tracked Assets",
              value: trackedAssets > 0 ? String(trackedAssets) : "—",
              sub: "in top hourly buckets",
            },
            {
              label: "Top Asset",
              value: topAsset,
              sub:
                topAsset !== "—"
                  ? `$${millify(assetTotals[topAsset])} vol`
                  : "no data",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "oklch(0.13 0 0)",
                border: "1px solid oklch(1 0 0 / 7%)",
                borderRadius: 8,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "oklch(0.42 0 0)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: isLoading ? "oklch(0.25 0 0)" : "oklch(0.96 0 0)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  marginBottom: 4,
                  transition: "color 0.2s",
                }}
              >
                {isLoading ? "···" : s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "oklch(0.45 0 0)",
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Hourly volume chart ────────────────────────────────────── */}
        <div
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(1 0 0 / 7%)",
            borderRadius: 12,
            padding: 24,
            marginBottom: 12,
          }}
        >
          {/* Chart header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "oklch(0.42 0 0)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Hourly Volume · {metricLabel}
            </span>

            <div className="flex items-center gap-2">
              {activeData && activeData.volume > 0 ? (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    color: "oklch(0.72 0.18 248)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {padH(activeData.hour)} UTC — $
                  {millify(activeData.volume, { precision: 2 })}
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    color: "oklch(0.32 0 0)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {isLoading
                    ? "loading..."
                    : isError
                      ? "failed to load"
                      : "hover a bar for details"}
                </span>
              )}

              <div
                style={{
                  width: 1,
                  height: 14,
                  background: "oklch(1 0 0 / 10%)",
                }}
              />

              {LOOKBACK_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setLookbackDays(d)}
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

          {/* Chart area */}
          <div style={{ position: "relative", height: CHART_H + AXIS_H }}>
            {isError ? (
              <div
                style={{
                  height: CHART_H,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "oklch(0.45 0 0)",
                  letterSpacing: "0.06em",
                }}
              >
                Failed to load data · check API connection
              </div>
            ) : isLoading ? (
              <SkeletonBars />
            ) : (
              <>
                {/* Session bands */}
                {SESSIONS.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${(s.start / 24) * 100}%`,
                      width: `${((s.end - s.start) / 24) * 100}%`,
                      height: CHART_H,
                      background: `oklch(0.60 0.12 ${s.hue} / 7%)`,
                      borderRadius: 4,
                      pointerEvents: "none",
                    }}
                  />
                ))}

                {/* Y-axis grid lines */}
                {[0.25, 0.5, 0.75, 1].map((frac) => (
                  <div
                    key={frac}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: CHART_H * (1 - frac),
                      height: 1,
                      background: "oklch(1 0 0 / 5%)",
                      pointerEvents: "none",
                    }}
                  />
                ))}

                {/* Bars */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: CHART_H,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 3,
                  }}
                >
                  {hourlyData.map((d) => {
                    const barH = Math.max(
                      d.volume > 0 ? 3 : 0,
                      Math.round((d.volume / maxVol) * CHART_H),
                    );
                    const isActive = activeHour === d.hour;
                    const isCurrent = d.hour === currentHour;

                    return (
                      <div
                        key={d.hour}
                        style={{
                          flex: 1,
                          height: CHART_H,
                          display: "flex",
                          alignItems: "flex-end",
                        }}
                        onMouseEnter={() => setActiveHour(d.hour)}
                        onMouseLeave={() => setActiveHour(null)}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: barH,
                            borderRadius: "2px 2px 0 0",
                            transformOrigin: "bottom",
                            animationName: "barGrow",
                            animationDuration: "0.55s",
                            animationTimingFunction:
                              "cubic-bezier(0.22, 1, 0.36, 1)",
                            animationDelay: `${d.hour * 18}ms`,
                            animationFillMode: "backwards",
                            background: isCurrent
                              ? "linear-gradient(to top, oklch(0.60 0.22 75 / 70%), oklch(0.88 0.24 75))"
                              : isActive
                                ? "linear-gradient(to top, oklch(0.52 0.20 248 / 80%), oklch(0.82 0.22 248))"
                                : "linear-gradient(to top, oklch(0.38 0.16 248 / 55%), oklch(0.62 0.18 248 / 85%))",
                            boxShadow: isCurrent
                              ? "0 0 16px oklch(0.82 0.22 75 / 55%)"
                              : isActive
                                ? "0 0 12px oklch(0.72 0.18 248 / 45%)"
                                : "none",
                            transition: "background 0.12s, box-shadow 0.12s",
                            cursor: "crosshair",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Hour axis labels */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: AXIS_H,
                    display: "flex",
                  }}
                >
                  {hourlyData.map((d) => (
                    <div
                      key={d.hour}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.48rem",
                        color:
                          d.hour === currentHour
                            ? "oklch(0.82 0.22 75)"
                            : activeHour === d.hour
                              ? "oklch(0.72 0.18 248)"
                              : "oklch(0.32 0 0)",
                        letterSpacing: "0.03em",
                        transition: "color 0.12s",
                      }}
                    >
                      {d.hour % 4 === 0 || d.hour === currentHour
                        ? String(d.hour).padStart(2, "0")
                        : ""}
                    </div>
                  ))}
                </div>

                {/* Hover tooltip */}
                {activeData && activeData.volume > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: `${((activeData.hour + 0.5) / 24) * 100}%`,
                      transform: tooltipTransform,
                      background: "oklch(0.16 0 0)",
                      border: "1px solid oklch(0.72 0.18 248 / 22%)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      zIndex: 20,
                      minWidth: 168,
                      pointerEvents: "none",
                      boxShadow: "0 8px 32px oklch(0 0 0 / 70%)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "oklch(0.72 0.18 248)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      {padH(activeData.hour)} UTC
                    </div>
                    {activeData.topAssets.map((a) => (
                      <div
                        key={a.symbol}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            color: "oklch(0.60 0 0)",
                          }}
                        >
                          {a.symbol}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            color: "oklch(0.86 0 0)",
                          }}
                        >
                          ${millify(a.volume)}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.58rem",
                          color: "oklch(0.4 0 0)",
                        }}
                      >
                        Total
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          color: "oklch(0.96 0 0)",
                        }}
                      >
                        ${millify(activeData.volume, { precision: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Session legend */}
          <div
            className="mt-4 flex flex-wrap items-center gap-4"
            style={{ paddingTop: 14, borderTop: "1px solid oklch(1 0 0 / 6%)" }}
          >
            {SESSIONS.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: `oklch(0.60 0.15 ${s.hue} / 55%)`,
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
                  {s.name} Session
                </span>
              </div>
            ))}
            <div className="flex-1" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.56rem",
                color: "oklch(0.35 0 0)",
                letterSpacing: "0.04em",
              }}
            >
              Hover bars for asset breakdown
            </span>
          </div>
        </div>

        {/* ── Asset breakdown ────────────────────────────────────────── */}
        <div
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(1 0 0 / 7%)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "oklch(0.42 0 0)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            24h Volume by Asset · {metricLabel}
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div
                    style={{
                      height: 10,
                      background: "oklch(1 0 0 / 5%)",
                      borderRadius: 3,
                      marginBottom: 6,
                      width: `${40 + i * 8}%`,
                      animation: "pulse 1.6s ease-in-out infinite",
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                  <div
                    style={{
                      height: 5,
                      background: "oklch(1 0 0 / 5%)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "oklch(0.45 0 0)",
                letterSpacing: "0.06em",
              }}
            >
              No data available
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sortedAssets.map(([symbol, vol], i) => {
                const pct = (vol / maxAssetVol) * 100;
                const hue = 248 - i * 12;
                return (
                  <div key={symbol}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "oklch(0.72 0 0)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {symbol}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          color: "oklch(0.52 0 0)",
                        }}
                      >
                        ${millify(vol, { precision: 1 })}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 3,
                          background: `linear-gradient(to right, oklch(0.42 0.16 ${hue} / 70%), oklch(0.68 0.18 ${hue}))`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
