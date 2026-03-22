import { useState } from "react";
import rawLong from "./raw-long";
import rawShort from "./raw-short";

/* ── Converter: external format → dashboard format ── */
function convertTrades(raw) {
  return raw.map((t) => {
    const sl = t.slPct;
    const tp = t.tpPct;
    const rr = Math.round(tp / sl);
    const open = t.total - t.wins - t.losses;
    return {
      label: `${sl}:${tp}`,
      sl,
      tp,
      rr,
      wins: t.wins,
      losses: t.losses,
      open,
      total: t.total,
      winRate: t.winRate,
      expectancy: t.expectancy,
      timeouts: t.timeouts ?? 0,
      timeoutRate: t.timeoutRate ?? 0,
      avgTimeoutPnl: t.avgTimeoutPnl ?? 0,
    };
  });
}

const longTrades = convertTrades(rawLong);
const shortTrades = convertTrades(rawShort);

/* ── Helpers ── */
function deriveLevels(trades) {
  const sls = new Set(),
    rrs = new Set();
  trades.forEach((t) => {
    sls.add(t.sl);
    rrs.add(t.rr);
  });
  return {
    slLevels: [...sls].sort((a, b) => a - b),
    rrLevels: [...rrs].sort((a, b) => a - b),
  };
}

function expColor(v, max) {
  if (v < 0)
    return `rgba(239,68,68,${Math.min(Math.abs(v) / 1.5, 1) * 0.45 + 0.1})`;
  return `rgba(34,197,94,${Math.min(v / max, 1) * 0.5 + 0.06})`;
}

function buildGrid(trades) {
  const g = {};
  trades.forEach((t) => {
    if (!g[t.sl]) g[t.sl] = {};
    g[t.sl][t.rr] = t;
  });
  return g;
}

function Heatmap({ trades, label, color, maxExp }) {
  const { slLevels, rrLevels } = deriveLevels(trades);
  const grid = buildGrid(trades);
  return (
    <div style={{ flex: "1 1 480px", minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ color }}>{label}</span>
        <span
          style={{
            color: "#64748b",
            fontWeight: 400,
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          {trades[0]?.total} alerts
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 2,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "6px 8px",
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "left",
                }}
              >
                SL\R:R
              </th>
              {rrLevels.map((rr) => (
                <th
                  key={rr}
                  style={{
                    padding: "6px 8px",
                    fontSize: 11,
                    color: "#94a3b8",
                    textAlign: "center",
                  }}
                >
                  1:{rr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slLevels.map((sl) => (
              <tr key={sl}>
                <td
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  {sl}%
                </td>
                {rrLevels.map((rr) => {
                  const t = grid[sl]?.[rr];
                  if (!t)
                    return (
                      <td
                        key={rr}
                        style={{
                          background: "#1a1d29",
                          borderRadius: 4,
                          textAlign: "center",
                          padding: 6,
                          fontSize: 11,
                          color: "#4a4d59",
                        }}
                      >
                        —
                      </td>
                    );
                  const to = t.timeoutRate || 0;
                  return (
                    <td
                      key={rr}
                      style={{
                        background: expColor(t.expectancy, maxExp),
                        borderRadius: 6,
                        padding: "8px 6px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: t.expectancy >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {t.expectancy >= 0 ? "+" : ""}
                        {t.expectancy.toFixed(2)}%
                      </div>
                      <div
                        style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}
                      >
                        {t.winRate.toFixed(1)}% WR
                      </div>
                      {to > 0 && (
                        <div
                          style={{
                            fontSize: 9,
                            color: "#a78bfa",
                            marginTop: 1,
                          }}
                        >
                          ⏱ {to.toFixed(0)}% · avg{" "}
                          {t.avgTimeoutPnl >= 0 ? "+" : ""}
                          {t.avgTimeoutPnl.toFixed(1)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTable({ trades, label, color }) {
  const sorted = [...trades].sort((a, b) => b.expectancy - a.expectancy);
  const th = {
    padding: "8px 6px",
    fontSize: 10,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #2a2d39",
  };
  const td = { padding: "7px 6px", fontSize: 12 };
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
        <span style={{ color }}>{label}</span>
        <span
          style={{
            color: "#64748b",
            fontWeight: 400,
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          sorted by expectancy
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>SL:TP</th>
              <th style={{ ...th, textAlign: "right" }}>R:R</th>
              <th style={{ ...th, textAlign: "right" }}>WR</th>
              <th style={{ ...th, textAlign: "right" }}>Exp</th>
              <th style={{ ...th, textAlign: "right" }}>W</th>
              <th style={{ ...th, textAlign: "right" }}>L</th>
              <th style={{ ...th, textAlign: "right" }}>⏱ T/O%</th>
              <th style={{ ...th, textAlign: "right" }}>Avg T/O PnL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr
                key={t.label}
                style={{
                  borderBottom: "1px solid #1a1d29",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <td style={{ ...td, fontWeight: 600 }}>
                  {t.sl}:{t.tp}
                </td>
                <td style={{ ...td, textAlign: "right", color: "#94a3b8" }}>
                  1:{t.rr}
                </td>
                <td style={{ ...td, textAlign: "right", color: "#94a3b8" }}>
                  {t.winRate.toFixed(1)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontWeight: 700,
                    color: t.expectancy >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {t.expectancy >= 0 ? "+" : ""}
                  {t.expectancy.toFixed(2)}%
                </td>
                <td style={{ ...td, textAlign: "right", color: "#94a3b8" }}>
                  {t.wins}
                </td>
                <td style={{ ...td, textAlign: "right", color: "#94a3b8" }}>
                  {t.losses}
                </td>
                <td style={{ ...td, textAlign: "right", color: "#a78bfa" }}>
                  {t.timeoutRate > 0 ? `${t.timeoutRate.toFixed(0)}%` : "—"}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    color: t.avgTimeoutPnl >= 0 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {t.timeoutRate > 0
                    ? `${t.avgTimeoutPnl >= 0 ? "+" : ""}${t.avgTimeoutPnl.toFixed(2)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("heatmaps");
  const maxExp = Math.max(
    ...longTrades.map((t) => t.expectancy),
    ...shortTrades.map((t) => t.expectancy),
  );

  const best = (arr) =>
    [...arr].sort((a, b) => b.expectancy - a.expectancy).slice(0, 3);
  const longBest = best(longTrades);
  const shortBest = best(shortTrades);

  const btn = (act) => ({
    background: act ? "#3b82f6" : "#1a1d29",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  });

  return (
    <div
      style={{
        fontFamily: "system-ui,-apple-system,sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Trade Simulation Dashboard
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
          <span style={{ color: "#3b82f6" }}>■</span> {longTrades[0]?.total}{" "}
          LONG &nbsp;·&nbsp;
          <span style={{ color: "#f97316" }}>■</span> {shortTrades[0]?.total}{" "}
          SHORT &nbsp;·&nbsp; 30-candle auto-close
        </p>

        {/* Top picks */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 300px",
              background:
                "linear-gradient(135deg,rgba(59,130,246,0.08),transparent)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3b82f6",
                marginBottom: 8,
              }}
            >
              🟢 BEST LONG
            </div>
            {longBest.map((t, i) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 2 ? "1px solid #1a1d29" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  SL {t.sl}% → TP {t.tp}%
                </span>
                <span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>
                    +{t.expectancy.toFixed(2)}%
                  </span>
                  <span style={{ color: "#64748b", marginLeft: 8 }}>
                    {t.winRate.toFixed(1)}% WR
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              flex: "1 1 300px",
              background:
                "linear-gradient(135deg,rgba(249,115,22,0.08),transparent)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f97316",
                marginBottom: 8,
              }}
            >
              🔴 BEST SHORT
            </div>
            {shortBest.map((t, i) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: i < 2 ? "1px solid #1a1d29" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  SL {t.sl}% → TP {t.tp}%
                </span>
                <span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>
                    +{t.expectancy.toFixed(2)}%
                  </span>
                  <span style={{ color: "#64748b", marginLeft: 8 }}>
                    {t.winRate.toFixed(1)}% WR
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setView("heatmaps")}
            style={btn(view === "heatmaps")}
          >
            Heatmaps
          </button>
          <button
            onClick={() => setView("table")}
            style={btn(view === "table")}
          >
            Table
          </button>
        </div>

        {view === "heatmaps" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Heatmap
              trades={longTrades}
              label="LONG"
              color="#3b82f6"
              maxExp={maxExp}
            />
            <Heatmap
              trades={shortTrades}
              label="SHORT"
              color="#f97316"
              maxExp={maxExp}
            />
          </div>
        )}

        {view === "table" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <DataTable trades={longTrades} label="LONG" color="#3b82f6" />
            <DataTable trades={shortTrades} label="SHORT" color="#f97316" />
          </div>
        )}
      </div>
    </div>
  );
}
