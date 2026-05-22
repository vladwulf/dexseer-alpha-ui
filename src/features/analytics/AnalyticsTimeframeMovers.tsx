import { useState } from "react";
import { useGetTimeframeMovers } from "./hooks/analytics.api";
import type { AnalyticsMoversTimeframe, AnalyticsTimeframeMoversBucket } from "./types";

const CHART_H = 180;
const AXIS_H = 28;

const SESSIONS = [
  { name: "Asia", start: 0, end: 9, hue: 300 },
  { name: "Europe", start: 7, end: 16, hue: 230 },
  { name: "US", start: 13, end: 22, hue: 50 },
];

function padH(h: number) {
  return String(h).padStart(2, "0") + ":00";
}

function normalizeMovers(buckets: AnalyticsTimeframeMoversBucket[]) {
  const byHour = new Map(buckets.map((b) => [b.hour, b]));
  return Array.from({ length: 24 }, (_, hour) => {
    const b = byHour.get(hour);
    return {
      hour,
      gainers: b?.gainers ?? 0,
      losers: b?.losers ?? 0,
      medianReturn: b?.medianReturn ?? 0,
      topGainer: b?.topGainer ?? null,
      topLoser: b?.topLoser ?? null,
    };
  });
}

const THRESHOLDS = [1, 2, 3, 5, 7, 10, 15, 20] as const;
const LOOKBACK_OPTIONS = [7, 14, 30, 90] as const;
const TIMEFRAME_OPTIONS: AnalyticsMoversTimeframe[] = ["m", "15m", "30m", "1h", "4h", "1d"];

function formatTimeframeLabel(timeframe: AnalyticsMoversTimeframe) {
  return timeframe === "m" ? "1m" : timeframe;
}

export function AnalyticsTimeframeMovers() {
  const [threshold, setThreshold] = useState<(typeof THRESHOLDS)[number]>(2);
  const [lookbackDays, setLookbackDays] = useState<(typeof LOOKBACK_OPTIONS)[number]>(14);
  const [timeframe, setTimeframe] = useState<AnalyticsMoversTimeframe>("1h");
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const currentHour = new Date().getUTCHours();

  const { data, isLoading, isError } = useGetTimeframeMovers({ threshold, lookbackDays, timeframe });

  const hourlyData = normalizeMovers(data?.buckets ?? []);
  const maxGainers = Math.max(...hourlyData.map((d) => d.gainers), 1);
  const maxLosers = Math.max(...hourlyData.map((d) => d.losers), 1);
  const halfH = CHART_H / 2;

  const activeData = activeHour !== null ? hourlyData[activeHour] : null;
  const tooltipTransform =
    activeHour !== null && activeHour > 19
      ? "translateX(-88%)"
      : activeHour !== null && activeHour < 4
        ? "translateX(-12%)"
        : "translateX(-50%)";

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
          Movers By Timeframe
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
          Assets moving ±{threshold}% on {formatTimeframeLabel(timeframe)} candles · hourly distribution
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
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div />
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as AnalyticsMoversTimeframe)}
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
            {TIMEFRAME_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
                style={{ background: "oklch(0.14 0 0)", color: "oklch(0.86 0 0)" }}
              >
                {formatTimeframeLabel(option)}
              </option>
            ))}
          </select>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) as (typeof THRESHOLDS)[number])}
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
            {THRESHOLDS.map((t) => (
              <option key={t} value={t} style={{ background: "oklch(0.14 0 0)", color: "oklch(0.86 0 0)" }}>
                ±{t}%
              </option>
            ))}
          </select>
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
                transition: "color 0.15s, background 0.15s, border-color 0.15s",
                background: lookbackDays === d ? "oklch(0.72 0.18 248 / 12%)" : "transparent",
                borderColor: lookbackDays === d ? "oklch(0.72 0.18 248 / 35%)" : "oklch(1 0 0 / 10%)",
                color: lookbackDays === d ? "oklch(0.72 0.18 248)" : "oklch(0.48 0 0)",
              }}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

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
              color: "oklch(0.35 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            Failed to load · check API connection
          </div>
        ) : isLoading ? (
          <div style={{ display: "flex", alignItems: "center", height: CHART_H, gap: 3 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "35%",
                  background: "oklch(1 0 0 / 5%)",
                  borderRadius: 2,
                  animation: "pulse 1.6s ease-in-out infinite",
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
          </div>
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
                  background: `oklch(0.60 0.12 ${s.hue} / 5%)`,
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Center baseline */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: halfH,
                height: 1,
                background: "oklch(1 0 0 / 12%)",
                pointerEvents: "none",
              }}
            />

            {/* Bars */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: CHART_H,
                display: "flex",
                gap: 3,
              }}
            >
              {hourlyData.map((d) => {
                const gH = Math.max(d.gainers > 0 ? 2 : 0, Math.round((d.gainers / maxGainers) * (halfH - 6)));
                const lH = Math.max(d.losers > 0 ? 2 : 0, Math.round((d.losers / maxLosers) * (halfH - 6)));
                const isActive = activeHour === d.hour;
                const isCurrent = d.hour === currentHour;

                return (
                  <div
                    key={d.hour}
                    style={{ flex: 1, height: CHART_H, position: "relative", cursor: "crosshair" }}
                    onMouseEnter={() => setActiveHour(d.hour)}
                    onMouseLeave={() => setActiveHour(null)}
                  >
                    {gH > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: halfH + 1,
                          left: 0,
                          right: 0,
                          height: gH,
                          borderRadius: "2px 2px 0 0",
                          background: isCurrent
                            ? "oklch(0.75 0.22 145)"
                            : isActive
                              ? "oklch(0.68 0.20 145)"
                              : "oklch(0.52 0.16 145 / 75%)",
                          boxShadow: isActive ? "0 0 10px oklch(0.68 0.20 145 / 35%)" : "none",
                          transition: "background 0.12s, box-shadow 0.12s",
                          animationName: "barGrow",
                          animationDuration: "0.55s",
                          animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                          animationDelay: `${d.hour * 18}ms`,
                          animationFillMode: "backwards",
                          transformOrigin: "bottom",
                        }}
                      />
                    )}
                    {lH > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: halfH + 1,
                          left: 0,
                          right: 0,
                          height: lH,
                          borderRadius: "0 0 2px 2px",
                          background: isCurrent
                            ? "oklch(0.62 0.22 25)"
                            : isActive
                              ? "oklch(0.58 0.20 25)"
                              : "oklch(0.46 0.16 25 / 75%)",
                          boxShadow: isActive ? "0 0 10px oklch(0.58 0.20 25 / 35%)" : "none",
                          transition: "background 0.12s, box-shadow 0.12s",
                          animationName: "barGrow",
                          animationDuration: "0.55s",
                          animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                          animationDelay: `${d.hour * 18}ms`,
                          animationFillMode: "backwards",
                          transformOrigin: "top",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hour axis */}
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
                        ? "oklch(0.75 0.22 145)"
                        : activeHour === d.hour
                          ? "oklch(0.72 0.18 248)"
                          : "oklch(0.32 0 0)",
                    letterSpacing: "0.03em",
                    transition: "color 0.12s",
                  }}
                >
                  {d.hour % 4 === 0 || d.hour === currentHour ? String(d.hour).padStart(2, "0") : ""}
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {activeData && (activeData.gainers > 0 || activeData.losers > 0) && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: `${((activeData.hour + 0.5) / 24) * 100}%`,
                  transform: tooltipTransform,
                  background: "oklch(0.16 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  zIndex: 20,
                  minWidth: 160,
                  pointerEvents: "none",
                  boxShadow: "0 8px 32px oklch(0 0 0 / 70%)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.42 0 0)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {padH(activeData.hour)} UTC
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: "oklch(0.62 0.18 145)",
                    }}
                  >
                    ↑ Gainers
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "oklch(0.86 0 0)" }}
                  >
                    {activeData.gainers}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: activeData.topGainer ? 8 : 0,
                  }}
                >
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "oklch(0.58 0.18 25)" }}
                  >
                    ↓ Losers
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "oklch(0.86 0 0)" }}
                  >
                    {activeData.losers}
                  </span>
                </div>
                {activeData.topGainer && (
                  <div
                    style={{
                      paddingTop: 8,
                      borderTop: "1px solid oklch(1 0 0 / 8%)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.56rem",
                        color: "oklch(0.38 0 0)",
                        marginBottom: 4,
                        letterSpacing: "0.06em",
                      }}
                    >
                      Top gainer
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "oklch(0.62 0.18 145)" }}
                      >
                        {activeData.topGainer.symbol}
                      </span>
                      <span
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "oklch(0.62 0.18 145)" }}
                      >
                        +{activeData.topGainer.changePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-4"
        style={{ paddingTop: 12, borderTop: "1px solid oklch(1 0 0 / 6%)" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 8, height: 8, borderRadius: 2, background: "oklch(0.52 0.16 145 / 75%)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              color: "oklch(0.42 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            Gainers ≥+{threshold}% on {formatTimeframeLabel(timeframe)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 8, height: 8, borderRadius: 2, background: "oklch(0.46 0.16 25 / 75%)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              color: "oklch(0.42 0 0)",
              letterSpacing: "0.06em",
            }}
          >
            Losers ≤−{threshold}% on {formatTimeframeLabel(timeframe)}
          </span>
        </div>
      </div>
    </div>
    </>
  );
}
