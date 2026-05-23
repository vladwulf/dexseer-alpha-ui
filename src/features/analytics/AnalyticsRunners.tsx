import { useEffect, useState } from "react";
import { useGetRunners, useGetRunnersReplay } from "./hooks/analytics.api";
import type { RunnerBoard, RunnerEntry, RunnerMetric } from "./types";

const PLAYBACK_MS = 350;

type BoardOption = {
  key: RunnerBoard;
  label: string;
  title: string;
  subtitle: (metricLabel: string) => string;
  panelLabel: (metricLabel: string) => string;
  leaderLabel: string;
  emptyLive: string;
  valueTicks: string[];
};

const BOARD_OPTIONS: BoardOption[] = [
  {
    key: "long",
    label: "LONG",
    title: "Asset Race Runner",
    subtitle: (metricLabel) => `Top 10 Gainers · ${metricLabel} % Change`,
    panelLabel: (metricLabel) => `Race Track · ${metricLabel} Change`,
    leaderLabel: "Leader",
    emptyLive: "Waiting for live data",
    valueTicks: ["0%", "25%", "50%", "75%", "100%"],
  },
  {
    key: "short",
    label: "SHORT",
    title: "Asset Race Runner",
    subtitle: (metricLabel) => `Top 10 Losers · ${metricLabel} % Change`,
    panelLabel: (metricLabel) => `Race Track · ${metricLabel} Change`,
    leaderLabel: "Leader",
    emptyLive: "Waiting for live data",
    valueTicks: ["0%", "25%", "50%", "75%", "100%"],
  },
  {
    key: "volume",
    label: "VOLUME",
    title: "Asset Volume Runner",
    subtitle: (metricLabel) => `Top 10 By Volume · ${metricLabel}`,
    panelLabel: (metricLabel) => `Race Track · ${metricLabel} Volume`,
    leaderLabel: "Volume Leader",
    emptyLive: "Waiting for live data",
    valueTicks: ["0", "25", "50", "75", "100"],
  },
];

function metricValueOf(
  entry: RunnerEntry,
  board: RunnerBoard,
  metric: RunnerMetric,
): number {
  if (board === "volume") {
    return metric === "1d" ? (entry.volume_1d ?? 0) : (entry.volume_4h ?? 0);
  }
  return metric === "1d" ? (entry.change_1d ?? 0) : (entry.change_4h ?? 0);
}

function fmtChange(val: number): string {
  return `${(val >= 0 ? "+" : "") + val.toFixed(2)}%`;
}

function fmtVolume(val: number): string {
  return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtMetricValue(val: number, board: RunnerBoard): string {
  return board === "volume" ? fmtVolume(val) : fmtChange(val);
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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

function fmtPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : price < 100 ? 4 : 2,
  });
}

type RankColors = {
  bar: string;
  tip: string;
  glow: string;
  text: string;
  badgeBg: string;
  badgeText: string;
};

function getRankColors(rank: number): RankColors {
  if (rank === 1)
    return {
      bar: "linear-gradient(to right, oklch(0.28 0.14 75 / 50%), oklch(0.58 0.20 75 / 88%), oklch(0.82 0.22 75))",
      tip: "oklch(0.90 0.22 75)",
      glow: "0 0 24px oklch(0.72 0.22 75 / 80%), 0 0 48px oklch(0.72 0.22 75 / 35%)",
      text: "oklch(0.88 0.22 75)",
      badgeBg: "oklch(0.72 0.22 75)",
      badgeText: "oklch(0.10 0 0)",
    };
  if (rank === 2)
    return {
      bar: "linear-gradient(to right, oklch(0.22 0.14 142 / 50%), oklch(0.48 0.20 142 / 88%), oklch(0.70 0.24 142))",
      tip: "oklch(0.80 0.24 142)",
      glow: "0 0 18px oklch(0.65 0.22 142 / 70%)",
      text: "oklch(0.76 0.22 142)",
      badgeBg: "oklch(0.60 0.22 142)",
      badgeText: "oklch(0.10 0 0)",
    };
  if (rank === 3)
    return {
      bar: "linear-gradient(to right, oklch(0.18 0.08 142 / 50%), oklch(0.36 0.12 142 / 88%), oklch(0.52 0.16 142))",
      tip: "oklch(0.62 0.16 142)",
      glow: "0 0 12px oklch(0.50 0.14 142 / 55%)",
      text: "oklch(0.58 0.14 142)",
      badgeBg: "oklch(0.44 0.13 142)",
      badgeText: "oklch(0.96 0 0)",
    };
  const fade = Math.max(0, 1 - (rank - 4) / 7);
  const l = 0.38 + fade * 0.14;
  const c = 0.1 + fade * 0.06;
  return {
    bar: `linear-gradient(to right, oklch(0.18 0.08 248 / 45%), oklch(${(l - 0.08).toFixed(2)} ${c} 248 / 80%), oklch(${l.toFixed(2)} ${c} 248))`,
    tip: `oklch(${(l + 0.12).toFixed(2)} ${(c + 0.04).toFixed(2)} 248)`,
    glow: `0 0 10px oklch(${l.toFixed(2)} ${c} 248 / ${Math.round(30 + fade * 20)}%)`,
    text: `oklch(${(l + 0.1).toFixed(2)} ${c} 248)`,
    badgeBg: "transparent",
    badgeText: "oklch(0.28 0 0)",
  };
}

function RankBadge({ rank }: { rank: number }) {
  const colors = getRankColors(rank);
  const label =
    rank === 1 ? "1ST" : rank === 2 ? "2ND" : rank === 3 ? "3RD" : String(rank);
  const hasColor = rank <= 3;

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: hasColor ? colors.badgeBg : "transparent",
        boxShadow: hasColor ? `0 0 10px ${colors.badgeBg} / 40%)` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: hasColor ? "none" : "1px solid oklch(1 0 0 / 6%)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: rank <= 3 ? "0.58rem" : "0.62rem",
          fontWeight: 700,
          color: hasColor ? colors.badgeText : "oklch(0.26 0 0)",
          letterSpacing: rank <= 3 ? "-0.01em" : "0",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function RaceLane({
  entry,
  board,
  metric,
  maxValue,
  isLast,
}: {
  entry: RunnerEntry;
  board: RunnerBoard;
  metric: RunnerMetric;
  maxValue: number;
  isLast: boolean;
}) {
  const value = Math.abs(metricValueOf(entry, board, metric));
  const pct = Math.max(3, (value / maxValue) * 100);
  const colors = getRankColors(entry.rank);
  const isLeader = entry.rank === 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingTop: 9,
        paddingBottom: 9,
        borderBottom: isLast ? "none" : "1px solid oklch(1 0 0 / 4%)",
        position: "relative",
      }}
    >
      <RankBadge rank={entry.rank} />

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isLeader ? "0.78rem" : "0.66rem",
          fontWeight: isLeader ? 700 : 400,
          color: isLeader
            ? "oklch(0.95 0 0)"
            : `oklch(${0.46 + Math.max(0, (10 - entry.rank) / 14)} 0 0)`,
          width: 72,
          flexShrink: 0,
          letterSpacing: "0.03em",
        }}
      >
        {entry.symbol.replace("USDT", "")}
      </span>

      {/* Track */}
      <div
        style={{
          flex: 1,
          height: isLeader ? 24 : 14,
          background: "oklch(1 0 0 / 3%)",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle distance grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 24.75%, oklch(1 0 0 / 3%) 24.75%, oklch(1 0 0 / 3%) 25%, transparent 25%)",
            pointerEvents: "none",
          }}
        />

        {/* Fill bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            background: colors.bar,
            borderRadius: 4,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Shimmer sweep for leader */}
          {isLeader && (
            <div
              style={{
                position: "absolute",
                top: 0,
                height: "100%",
                width: "55%",
                background:
                  "linear-gradient(to right, transparent, oklch(1 0 0 / 22%), transparent)",
                animation: "raceShimmer 2s ease-in-out infinite",
              }}
            />
          )}
          {/* Tip glow */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: isLeader ? 5 : 2,
              height: "100%",
              background: colors.tip,
              boxShadow: colors.glow,
            }}
          />
        </div>
      </div>

      {/* Change */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isLeader ? "0.78rem" : "0.62rem",
          fontWeight: isLeader ? 700 : 400,
          color: colors.text,
          width: 70,
          textAlign: "right",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
        }}
      >
        {fmtMetricValue(metricValueOf(entry, board, metric), board)}
      </span>
    </div>
  );
}

function SkeletonLanes() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, laneIndex) => laneIndex).map(
        (laneIndex) => (
          <div
            key={`runner-skeleton-${laneIndex}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingTop: 9,
              paddingBottom: 9,
              borderBottom:
                laneIndex < 7 ? "1px solid oklch(1 0 0 / 4%)" : "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "oklch(1 0 0 / 5%)",
                flexShrink: 0,
                animation: `pulse 1.6s ${laneIndex * 60}ms ease-in-out infinite`,
              }}
            />
            <div
              style={{
                width: 72,
                height: 10,
                background: "oklch(1 0 0 / 5%)",
                borderRadius: 2,
                flexShrink: 0,
                animation: `pulse 1.6s ${laneIndex * 60}ms ease-in-out infinite`,
              }}
            />
            <div
              style={{
                flex: 1,
                height: 14,
                background: "oklch(1 0 0 / 5%)",
                borderRadius: 4,
                animation: `pulse 1.6s ${laneIndex * 60 + 30}ms ease-in-out infinite`,
              }}
            />
            <div
              style={{
                width: 70,
                height: 10,
                background: "oklch(1 0 0 / 5%)",
                borderRadius: 2,
                flexShrink: 0,
                animation: `pulse 1.6s ${laneIndex * 60}ms ease-in-out infinite`,
              }}
            />
          </div>
        ),
      )}
    </div>
  );
}

export function AnalyticsRunners() {
  const [board, setBoard] = useState<RunnerBoard>("long");
  const [metric, setMetric] = useState<RunnerMetric>("1d");
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const boardMeta =
    BOARD_OPTIONS.find((option) => option.key === board) ?? BOARD_OPTIONS[0];

  const {
    data: liveData,
    isLoading: liveLoading,
    isError: liveError,
  } = useGetRunners(board);
  const {
    data: replayData,
    isLoading: replayLoading,
    isError: replayError,
  } = useGetRunnersReplay(board, metric, mode === "replay");

  useEffect(() => {
    setFrameIdx(0);
    setIsPlaying(false);
  }, []);

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
    mode === "live"
      ? (liveData?.[metric]?.entries ?? [])
      : (replayData?.[frameIdx]?.entries ?? []);

  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const leader = sorted[0] ?? null;
  const leaderValue = leader ? metricValueOf(leader, board, metric) : 0;
  const maxValue = Math.max(
    ...sorted.map((e) => Math.abs(metricValueOf(e, board, metric))),
    0.01,
  );

  const updatedAt =
    mode === "live"
      ? (liveData?.[metric]?.updatedAt ?? null)
      : (replayData?.[frameIdx]?.sampledAt ?? null);
  const totalFrames = replayData?.length ?? 0;
  const metricLabel = metric === "1d" ? "24h" : "4h";

  return (
    <>
      <style>{`
        @keyframes raceShimmer {
          0%   { left: -65%; }
          100% { left: 165%; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.2; transform: scale(0.85); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes leaderPulse {
          0%, 100% { box-shadow: 0 0 0 1px oklch(0.72 0.22 75 / 20%), 0 0 24px oklch(0.82 0.22 75 / 18%); }
          50%       { box-shadow: 0 0 0 1px oklch(0.72 0.22 75 / 40%), 0 0 48px oklch(0.72 0.22 75 / 35%); }
        }
        @keyframes scanLine {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
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
              {boardMeta.title}
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
              {boardMeta.subtitle(metricLabel)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {BOARD_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setBoard(option.key)}
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
                    board === option.key
                      ? "oklch(0.72 0.18 248 / 12%)"
                      : "transparent",
                  borderColor:
                    board === option.key
                      ? "oklch(0.72 0.18 248 / 35%)"
                      : "oklch(1 0 0 / 10%)",
                  color:
                    board === option.key
                      ? "oklch(0.72 0.18 248)"
                      : "oklch(0.48 0 0)",
                }}
              >
                {option.label}
              </button>
            ))}

            <div
              style={{ width: 1, height: 16, background: "oklch(1 0 0 / 10%)" }}
            />

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
                  transition:
                    "color 0.15s, background 0.15s, border-color 0.15s",
                  background:
                    metric === m ? "oklch(0.72 0.18 248 / 12%)" : "transparent",
                  borderColor:
                    metric === m
                      ? "oklch(0.72 0.18 248 / 35%)"
                      : "oklch(1 0 0 / 10%)",
                  color:
                    metric === m ? "oklch(0.72 0.18 248)" : "oklch(0.48 0 0)",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}

            <div
              style={{ width: 1, height: 16, background: "oklch(1 0 0 / 10%)" }}
            />

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
                  transition:
                    "color 0.15s, background 0.15s, border-color 0.15s",
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
                        : "oklch(0.72 0.24 142)"
                      : "oklch(0.48 0 0)",
                }}
              >
                {md === "live" ? "● LIVE" : "▶ REPLAY"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_252px]">
          {/* Race track panel */}
          <div
            style={{
              background: "oklch(0.095 0 0)",
              border: "1px solid oklch(1 0 0 / 6%)",
              borderRadius: 12,
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle racing stripe accent top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                  "linear-gradient(to right, transparent, oklch(0.72 0.22 75 / 0%), oklch(0.72 0.22 75 / 40%), oklch(0.72 0.22 75 / 0%), transparent)",
              }}
            />

            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "oklch(0.36 0 0)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {boardMeta.panelLabel(metricLabel)}
                </span>
              </div>

              {mode === "live" && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    color: "oklch(0.46 0 0)",
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
                      flexShrink: 0,
                      animation: "livePulse 1.8s ease-in-out infinite",
                    }}
                  />
                  {updatedAt
                    ? `Updated ${fmtTime(updatedAt)}`
                    : "Waiting for data"}
                </span>
              )}

              {mode === "replay" && updatedAt && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    color: "oklch(0.42 0 0)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {fmtDateTime(updatedAt)}
                </span>
              )}
            </div>

            {/* Finish line column header */}
            {!isLoading && !isError && sorted.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingBottom: 8,
                  marginBottom: 2,
                  borderBottom: "1px solid oklch(1 0 0 / 6%)",
                }}
              >
                <div style={{ width: 32, flexShrink: 0 }} />
                <div style={{ width: 72, flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}
                >
                  {boardMeta.valueTicks.map((tick) => (
                    <span
                      key={tick}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.44rem",
                        color: "oklch(0.24 0 0)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {tick}
                    </span>
                  ))}
                </div>
                <div style={{ width: 70, flexShrink: 0 }} />
              </div>
            )}

            {isError ? (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "oklch(0.38 0 0)",
                  letterSpacing: "0.06em",
                  padding: "44px 0",
                  textAlign: "center",
                }}
              >
                Failed to load · check API connection
              </div>
            ) : isLoading ? (
              <SkeletonLanes />
            ) : sorted.length === 0 ? (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "oklch(0.30 0 0)",
                  letterSpacing: "0.06em",
                  padding: "44px 0",
                  textAlign: "center",
                }}
              >
                {mode === "replay"
                  ? "No replay data available"
                  : boardMeta.emptyLive}
              </div>
            ) : (
              <div>
                {sorted.map((entry, i) => (
                  <RaceLane
                    key={entry.asset_id}
                    entry={entry}
                    board={board}
                    metric={metric}
                    maxValue={maxValue}
                    isLast={i === sorted.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Leader podium */}
            <div
              style={{
                background: "oklch(0.10 0 0)",
                borderRadius: 12,
                padding: 22,
                position: "relative",
                overflow: "hidden",
                flex: 1,
                animation: leader
                  ? "leaderPulse 2.8s ease-in-out infinite"
                  : "none",
              }}
            >
              {/* Checkered background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-conic-gradient(oklch(0.72 0.22 75 / 4.5%) 0% 25%, transparent 0% 50%)",
                  backgroundSize: "26px 26px",
                  pointerEvents: "none",
                }}
              />

              {/* Diagonal speed-line overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent 0px, transparent 18px, oklch(0.72 0.22 75 / 2%) 18px, oklch(0.72 0.22 75 / 2%) 19px)",
                  pointerEvents: "none",
                }}
              />

              {/* Scan line effect */}
              {leader && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                      "linear-gradient(to right, transparent, oklch(0.72 0.22 75 / 30%), transparent)",
                    animation: "scanLine 4s linear infinite",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {/* Checkered flag icons */}
                  <span style={{ fontSize: "0.75rem" }}>🏁</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.54rem",
                      color: "oklch(0.50 0.18 75)",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    {boardMeta.leaderLabel}
                  </span>
                </div>

                {isLoading ? (
                  <>
                    <div
                      style={{
                        height: 24,
                        width: 110,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 4,
                        marginBottom: 12,
                        animation: "pulse 1.6s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 46,
                        width: 100,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 4,
                        marginBottom: 14,
                        animation: "pulse 1.6s 200ms ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: 80,
                        background: "oklch(1 0 0 / 5%)",
                        borderRadius: 3,
                        animation: "pulse 1.6s 400ms ease-in-out infinite",
                      }}
                    />
                  </>
                ) : leader ? (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2.4rem",
                        fontWeight: 700,
                        color: "oklch(0.96 0 0)",
                        letterSpacing: "-0.035em",
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {leader.symbol.replace("USDT", "")}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "2.9rem",
                        fontWeight: 700,
                        color: "oklch(0.88 0.22 75)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        marginBottom: 16,
                        textShadow:
                          "0 0 40px oklch(0.72 0.22 75 / 55%), 0 0 80px oklch(0.72 0.22 75 / 25%)",
                      }}
                    >
                      {fmtMetricValue(leaderValue, board)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.64rem",
                        color: "oklch(0.38 0 0)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      ${fmtPrice(leader.price)}
                    </div>

                    {/* Mini rank badges for 2nd and 3rd */}
                    {sorted.length > 1 && (
                      <div
                        style={{
                          marginTop: 20,
                          paddingTop: 16,
                          borderTop: "1px solid oklch(1 0 0 / 7%)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {sorted.slice(1, 3).map((e) => {
                          const c = getRankColors(e.rank);
                          return (
                            <div
                              key={e.asset_id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.58rem",
                                  color: "oklch(0.36 0 0)",
                                }}
                              >
                                #{e.rank}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.62rem",
                                  color: "oklch(0.58 0 0)",
                                  letterSpacing: "0.03em",
                                  flex: 1,
                                }}
                              >
                                {e.symbol.replace("USDT", "")}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.62rem",
                                  color: c.text,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {fmtMetricValue(
                                  metricValueOf(e, board, metric),
                                  board,
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: "oklch(0.30 0 0)",
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
                  background: "oklch(0.095 0 0)",
                  border: "1px solid oklch(1 0 0 / 6%)",
                  borderRadius: 12,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    color: "oklch(0.38 0 0)",
                    letterSpacing: "0.14em",
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
                      color: "oklch(0.32 0 0)",
                    }}
                  >
                    Loading frames…
                  </div>
                ) : replayData && replayData.length > 0 ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
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
                          border: "1px solid oklch(0.72 0.24 142 / 26%)",
                          borderRadius: 6,
                          padding: "6px 14px",
                          background: "oklch(0.72 0.24 142 / 10%)",
                          color: "oklch(0.72 0.24 142)",
                          transition: "background 0.12s",
                          flexShrink: 0,
                        }}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.54rem",
                          color: "oklch(0.34 0 0)",
                          fontVariantNumeric: "tabular-nums",
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
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        accentColor: "oklch(0.72 0.24 142)",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.48rem",
                          color: "oklch(0.26 0 0)",
                        }}
                      >
                        {fmtTime(replayData[0]?.sampledAt ?? null)}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.48rem",
                          color: "oklch(0.26 0 0)",
                        }}
                      >
                        {fmtTime(
                          replayData[totalFrames - 1]?.sampledAt ?? null,
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "oklch(0.32 0 0)",
                    }}
                  >
                    No replay data
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
