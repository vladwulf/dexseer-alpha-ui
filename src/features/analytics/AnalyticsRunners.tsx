import { useState, useEffect } from "react";
import { useGetRunners, useGetRunnersReplay } from "./hooks/analytics.api";
import type { RunnerEntry, RunnerMetric } from "./types";

const PLAYBACK_MS = 350;

function changeOf(entry: RunnerEntry, metric: RunnerMetric): number {
  return metric === "1d" ? (entry.change_1d ?? 0) : (entry.change_4h ?? 0);
}

function fmtChange(val: number): string {
  return (val >= 0 ? "+" : "") + val.toFixed(2) + "%";
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function SkeletonRows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 18,
              height: 10,
              background: "oklch(1 0 0 / 5%)",
              borderRadius: 2,
              flexShrink: 0,
              animation: "pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 60}ms`,
            }}
          />
          <div
            style={{
              width: 80,
              height: 10,
              background: "oklch(1 0 0 / 5%)",
              borderRadius: 2,
              flexShrink: 0,
              animation: "pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 60}ms`,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 8,
              background: "oklch(1 0 0 / 5%)",
              borderRadius: 4,
              animation: "pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 60 + 30}ms`,
            }}
          />
          <div
            style={{
              width: 56,
              height: 10,
              background: "oklch(1 0 0 / 5%)",
              borderRadius: 2,
              flexShrink: 0,
              animation: "pulse 1.6s ease-in-out infinite",
              animationDelay: `${i * 60}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function RaceRow({ entry, metric, maxChange }: { entry: RunnerEntry; metric: RunnerMetric; maxChange: number }) {
  const change = changeOf(entry, metric);
  const pct = (Math.abs(change) / maxChange) * 100;
  const isLeader = entry.rank === 1;
  const isPositive = change >= 0;

  const barColor = isLeader
    ? "linear-gradient(to right, oklch(0.62 0.20 75 / 80%), oklch(0.88 0.24 75))"
    : isPositive
      ? "linear-gradient(to right, oklch(0.50 0.18 142 / 70%), oklch(0.72 0.20 142))"
      : "linear-gradient(to right, oklch(0.48 0.18 20 / 70%), oklch(0.68 0.20 20))";

  const changeColor = isLeader
    ? "oklch(0.88 0.24 75)"
    : isPositive
      ? "oklch(0.72 0.20 142)"
      : "oklch(0.68 0.20 20)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.56rem",
          color: isLeader ? "oklch(0.82 0.22 75)" : "oklch(0.28 0 0)",
          width: 18,
          textAlign: "right",
          flexShrink: 0,
          fontWeight: isLeader ? 600 : 400,
        }}
      >
        {entry.rank}
      </span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: isLeader ? "oklch(0.94 0 0)" : "oklch(0.66 0 0)",
          width: 86,
          flexShrink: 0,
          letterSpacing: "0.03em",
          fontWeight: isLeader ? 600 : 400,
        }}
      >
        {entry.symbol.replace("USDT", "")}
      </span>

      <div
        style={{
          flex: 1,
          height: isLeader ? 10 : 7,
          background: "oklch(1 0 0 / 5%)",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            background: barColor,
            boxShadow: isLeader ? "0 0 14px oklch(0.82 0.22 75 / 50%)" : "none",
            transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: changeColor,
          width: 64,
          textAlign: "right",
          flexShrink: 0,
          fontWeight: isLeader ? 600 : 400,
          letterSpacing: "0.01em",
        }}
      >
        {fmtChange(change)}
      </span>
    </div>
  );
}

export function AnalyticsRunners() {
  const [metric, setMetric] = useState<RunnerMetric>("1d");
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: liveData, isLoading: liveLoading, isError: liveError } = useGetRunners();
  const { data: replayData, isLoading: replayLoading, isError: replayError } = useGetRunnersReplay(
    metric,
    mode === "replay",
  );

  useEffect(() => {
    setFrameIdx(0);
    setIsPlaying(false);
  }, [mode, metric]);

  useEffect(() => {
    if (!isPlaying || !replayData) return;
    const id = setInterval(() => {
      setFrameIdx((i) => {
        if (i >= replayData.length - 1) {
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, PLAYBACK_MS);
    return () => clearInterval(id);
  }, [isPlaying, replayData]);

  const isLoading = mode === "live" ? liveLoading : replayLoading;
  const isError = mode === "live" ? liveError : replayError;

  const entries: RunnerEntry[] =
    mode === "live" ? (liveData?.[metric]?.entries ?? []) : (replayData?.[frameIdx]?.entries ?? []);

  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const leader = sorted[0] ?? null;
  const leaderChange = leader ? changeOf(leader, metric) : 0;
  const maxChange = Math.max(...sorted.map((e) => Math.abs(changeOf(e, metric))), 0.01);

  const updatedAt = mode === "live" ? (liveData?.[metric]?.updatedAt ?? null) : (replayData?.[frameIdx]?.sampledAt ?? null);
  const totalFrames = replayData?.length ?? 0;
  const metricLabel = metric === "1d" ? "24h" : "4h";

  return (
    <>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>

      <div style={{ padding: "32px 0 48px" }}>
        {/* Header */}
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
              Asset Race Runner
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
              Top 10 Gainers · {metricLabel} % Change
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {(["1d", "4h"] as RunnerMetric[]).map((m) => (
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
                  transition: "color 0.15s, background 0.15s, border-color 0.15s",
                  background: metric === m ? "oklch(0.72 0.18 248 / 12%)" : "transparent",
                  borderColor: metric === m ? "oklch(0.72 0.18 248 / 35%)" : "oklch(1 0 0 / 10%)",
                  color: metric === m ? "oklch(0.72 0.18 248)" : "oklch(0.48 0 0)",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}

            <div style={{ width: 1, height: 16, background: "oklch(1 0 0 / 10%)" }} />

            {(["live", "replay"] as const).map((md) => (
              <button
                key={md}
                type="button"
                onClick={() => setMode(md)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  border: "1px solid",
                  borderRadius: 4,
                  padding: "4px 10px",
                  transition: "color 0.15s, background 0.15s, border-color 0.15s",
                  background:
                    mode === md
                      ? md === "live"
                        ? "oklch(0.68 0.22 142 / 12%)"
                        : "oklch(0.72 0.18 75 / 12%)"
                      : "transparent",
                  borderColor:
                    mode === md
                      ? md === "live"
                        ? "oklch(0.68 0.22 142 / 35%)"
                        : "oklch(0.72 0.18 75 / 35%)"
                      : "oklch(1 0 0 / 10%)",
                  color:
                    mode === md
                      ? md === "live"
                        ? "oklch(0.72 0.22 142)"
                        : "oklch(0.82 0.22 75)"
                      : "oklch(0.48 0 0)",
                }}
              >
                {md === "live" ? "● LIVE" : "▶ REPLAY"}
              </button>
            ))}
          </div>
        </div>

        {/* Layout: race bars + leader panel */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_268px]">
          {/* Race bars */}
          <div
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(1 0 0 / 7%)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            {/* Panel header */}
            <div className="mb-5 flex items-center justify-between">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "oklch(0.42 0 0)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Leaderboard · {metricLabel} Change
              </span>

              {mode === "live" && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.50 0 0)",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "oklch(0.72 0.22 142)",
                      display: "inline-block",
                      animation: "livePulse 1.8s ease-in-out infinite",
                    }}
                  />
                  {updatedAt ? `Updated ${fmtTime(updatedAt)}` : "Waiting for data"}
                </span>
              )}

              {mode === "replay" && updatedAt && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.46 0 0)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {fmtDateTime(updatedAt)}
                </span>
              )}
            </div>

            {isError ? (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "oklch(0.40 0 0)",
                  letterSpacing: "0.06em",
                  padding: "40px 0",
                  textAlign: "center",
                }}
              >
                Failed to load data · check API connection
              </div>
            ) : isLoading ? (
              <SkeletonRows />
            ) : sorted.length === 0 ? (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "oklch(0.32 0 0)",
                  letterSpacing: "0.06em",
                  padding: "40px 0",
                  textAlign: "center",
                }}
              >
                {mode === "replay" ? "No replay data available" : "Waiting for live data"}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sorted.map((entry) => (
                  <RaceRow key={entry.asset_id} entry={entry} metric={metric} maxChange={maxChange} />
                ))}
              </div>
            )}
          </div>

          {/* Right column: leader card + replay controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Leader card */}
            <div
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.82 0.22 75 / 18%)",
                borderRadius: 12,
                padding: 24,
                position: "relative",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {/* Checkered pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-conic-gradient(oklch(0.82 0.22 75 / 4%) 0% 25%, transparent 0% 50%)",
                  backgroundSize: "22px 22px",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    color: "oklch(0.50 0.14 75)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 18,
                  }}
                >
                  # 1 · Leader
                </div>

                {isLoading ? (
                  <>
                    <div
                      style={{
                        height: 22,
                        width: 110,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 3,
                        marginBottom: 14,
                        animation: "pulse 1.6s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 42,
                        width: 90,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 3,
                        animation: "pulse 1.6s ease-in-out infinite",
                      }}
                    />
                  </>
                ) : leader ? (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "oklch(0.94 0 0)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        marginBottom: 10,
                      }}
                    >
                      {leader.symbol.replace("USDT", "")}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2.6rem",
                        fontWeight: 700,
                        color: "oklch(0.88 0.24 75)",
                        letterSpacing: "-0.025em",
                        lineHeight: 1,
                        marginBottom: 14,
                        textShadow: "0 0 40px oklch(0.82 0.22 75 / 45%)",
                      }}
                    >
                      {fmtChange(leaderChange)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        color: "oklch(0.42 0 0)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      $
                      {leader.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: leader.price < 1 ? 6 : leader.price < 100 ? 4 : 2,
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "oklch(0.32 0 0)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    No data yet
                  </div>
                )}
              </div>
            </div>

            {/* Replay controls */}
            {mode === "replay" && (
              <div
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(1 0 0 / 7%)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    color: "oklch(0.40 0 0)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Replay Controls
                </div>

                {replayLoading ? (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "oklch(0.35 0 0)",
                    }}
                  >
                    Loading replay data…
                  </div>
                ) : replayData && replayData.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (frameIdx >= totalFrames - 1) setFrameIdx(0);
                          setIsPlaying((p) => !p);
                        }}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          cursor: "pointer",
                          border: "1px solid oklch(0.72 0.18 75 / 28%)",
                          borderRadius: 6,
                          padding: "6px 14px",
                          background: "oklch(0.72 0.18 75 / 10%)",
                          color: "oklch(0.82 0.22 75)",
                          transition: "background 0.12s",
                          flexShrink: 0,
                        }}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.56rem",
                          color: "oklch(0.36 0 0)",
                        }}
                      >
                        {frameIdx + 1} / {totalFrames}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={totalFrames - 1}
                      value={frameIdx}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setFrameIdx(Number(e.target.value));
                      }}
                      style={{ width: "100%", cursor: "pointer", accentColor: "oklch(0.82 0.22 75)" }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.5rem",
                          color: "oklch(0.28 0 0)",
                        }}
                      >
                        {fmtTime(replayData[0]?.sampledAt ?? null)}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.5rem",
                          color: "oklch(0.28 0 0)",
                        }}
                      >
                        {fmtTime(replayData[totalFrames - 1]?.sampledAt ?? null)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "oklch(0.35 0 0)",
                    }}
                  >
                    No replay data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
