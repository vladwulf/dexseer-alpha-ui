import { useState } from "react";
import { useGetBreakoutHours } from "./hooks/analytics.api";
import type { AnalyticsBreakoutHourBucket } from "./types";

const HEATMAP_H = 56;
const AXIS_H = 22;

const LOOKBACK_OPTIONS = [7, 14, 30, 90] as const;

const SESSIONS = [
  { name: "Asia", start: 0, end: 9, hue: 300 },
  { name: "Europe", start: 7, end: 16, hue: 230 },
  { name: "US", start: 13, end: 22, hue: 50 },
];

export function AnalyticsBreakoutHours() {
  const [lookbackDays, setLookbackDays] = useState<(typeof LOOKBACK_OPTIONS)[number]>(30);
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const currentHour = new Date().getUTCHours();

  const { data, isLoading, isError } = useGetBreakoutHours({ lookbackDays });

  const buckets: AnalyticsBreakoutHourBucket[] = data?.buckets ?? [];
  const byHour = new Map(buckets.map((b) => [b.hour, b]));
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const b = byHour.get(hour);
    return {
      hour,
      frequency: b?.frequency ?? 0,
      avgRangeExpansion: b?.avgRangeExpansion ?? 0,
    };
  });

  const maxFreq = Math.max(...hourlyData.map((d) => d.frequency), 0.001);

  // Top 3 breakout hours for the summary strip
  const top3 = [...hourlyData]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3)
    .filter((d) => d.frequency > 0);

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
          Breakout Hour Frequency
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
          How often each hour produces a daily high/low or range expansion
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
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: HEATMAP_H,
                background: "oklch(1 0 0 / 4%)",
                borderRadius: 4,
                animation: "pulse 1.6s ease-in-out infinite",
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Heatmap + axis */}
          <div
            style={{
              position: "relative",
              height: HEATMAP_H + AXIS_H,
            }}
          >
            {/* Session bands */}
            {SESSIONS.map((s) => (
              <div
                key={s.name}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${(s.start / 24) * 100}%`,
                  width: `${((s.end - s.start) / 24) * 100}%`,
                  height: HEATMAP_H,
                  background: `oklch(0.60 0.10 ${s.hue} / 7%)`,
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Heat cells */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: HEATMAP_H,
                display: "flex",
                gap: 3,
              }}
            >
              {hourlyData.map((d) => {
                const intensity = d.frequency / maxFreq;
                const L = 0.14 + intensity * 0.58;
                const C = 0.03 + intensity * 0.24;
                const isActive = activeHour === d.hour;
                const isCurrent = d.hour === currentHour;

                return (
                  <div
                    key={d.hour}
                    style={{
                      flex: 1,
                      height: HEATMAP_H,
                      borderRadius: 4,
                      background: isCurrent
                        ? `oklch(${Math.min(L + 0.08, 0.88)} ${Math.min(C + 0.06, 0.28)} 75)`
                        : `oklch(${L} ${C} 60)`,
                      border: isActive
                        ? "1px solid oklch(0.80 0.22 60 / 55%)"
                        : "1px solid oklch(1 0 0 / 4%)",
                      cursor: "crosshair",
                      transition: "border-color 0.12s",
                      position: "relative",
                    }}
                    onMouseEnter={() => setActiveHour(d.hour)}
                    onMouseLeave={() => setActiveHour(null)}
                  />
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
                        ? "oklch(0.82 0.22 75)"
                        : activeHour === d.hour
                          ? "oklch(0.80 0.20 60)"
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
            {activeData && activeData.frequency > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: `${((activeData.hour + 0.5) / 24) * 100}%`,
                  transform: `${tooltipTransform} translateY(-100%)`,
                  background: "oklch(0.16 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  zIndex: 20,
                  minWidth: 156,
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
                    marginBottom: 8,
                  }}
                >
                  {String(activeData.hour).padStart(2, "0")}:00 UTC
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "oklch(0.50 0 0)" }}
                  >
                    Breakout freq
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "oklch(0.82 0.20 60)",
                    }}
                  >
                    {(activeData.frequency * 100).toFixed(1)}%
                  </span>
                </div>
                {activeData.avgRangeExpansion > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.60rem", color: "oklch(0.50 0 0)" }}
                    >
                      Avg expansion
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "oklch(0.72 0 0)" }}
                    >
                      {activeData.avgRangeExpansion.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top hours summary */}
          {top3.length > 0 && (
            <div
              className="mt-4 flex flex-wrap items-center gap-3"
              style={{ paddingTop: 14, borderTop: "1px solid oklch(1 0 0 / 6%)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.56rem",
                  color: "oklch(0.35 0 0)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginRight: 4,
                }}
              >
                Top breakout hours
              </span>
              {top3.map((d, rank) => (
                <div
                  key={d.hour}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "oklch(1 0 0 / 4%)",
                    border: "1px solid oklch(1 0 0 / 7%)",
                    borderRadius: 5,
                    padding: "4px 10px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.54rem",
                      color: "oklch(0.32 0 0)",
                    }}
                  >
                    #{rank + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "oklch(0.82 0.20 60)",
                    }}
                  >
                    {String(d.hour).padStart(2, "0")}:00
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: "oklch(0.48 0 0)",
                    }}
                  >
                    {(d.frequency * 100).toFixed(0)}%
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    color: "oklch(0.30 0 0)",
                    letterSpacing: "0.06em",
                  }}
                >
                  low
                </span>
                <div
                  style={{
                    width: 64,
                    height: 6,
                    borderRadius: 3,
                    background:
                      "linear-gradient(to right, oklch(0.18 0.04 60), oklch(0.72 0.26 60))",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    color: "oklch(0.30 0 0)",
                    letterSpacing: "0.06em",
                  }}
                >
                  high
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
