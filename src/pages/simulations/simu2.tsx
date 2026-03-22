import { useState } from "react";

const strategies = [
  {
    label: "5:5@15",
    sl: 5,
    tp: 5,
    rr: "1:1",
    taken: 2853,
    exp: 1.464,
    wr: 63.7,
  },
  {
    label: "6:6@15",
    sl: 6,
    tp: 6,
    rr: "1:1",
    taken: 2786,
    exp: 1.699,
    wr: 63.2,
  },
  {
    label: "7:7@15",
    sl: 7,
    tp: 7,
    rr: "1:1",
    taken: 2728,
    exp: 1.795,
    wr: 61.7,
  },
  {
    label: "8:8@15",
    sl: 8,
    tp: 8,
    rr: "1:1",
    taken: 2725,
    exp: 1.925,
    wr: 60.5,
  },
  {
    label: "9:9@15",
    sl: 9,
    tp: 9,
    rr: "1:1",
    taken: 2714,
    exp: 2.017,
    wr: 59.8,
  },
  {
    label: "10:10@15",
    sl: 10,
    tp: 10,
    rr: "1:1",
    taken: 2701,
    exp: 2.019,
    wr: 58.8,
  },
  {
    label: "5:10@15",
    sl: 5,
    tp: 10,
    rr: "1:2",
    taken: 2700,
    exp: 1.93,
    wr: 53.8,
  },
  {
    label: "6:12@15",
    sl: 6,
    tp: 12,
    rr: "1:2",
    taken: 2698,
    exp: 1.976,
    wr: 54.4,
  },
  {
    label: "7:14@15",
    sl: 7,
    tp: 14,
    rr: "1:2",
    taken: 2694,
    exp: 2.118,
    wr: 55.0,
  },
  {
    label: "8:16@15",
    sl: 8,
    tp: 16,
    rr: "1:2",
    taken: 2690,
    exp: 2.196,
    wr: 55.2,
  },
  {
    label: "9:18@15",
    sl: 9,
    tp: 18,
    rr: "1:2",
    taken: 2686,
    exp: 2.283,
    wr: 55.5,
  },
  {
    label: "10:20@15",
    sl: 10,
    tp: 20,
    rr: "1:2",
    taken: 2686,
    exp: 2.271,
    wr: 55.4,
  },
  {
    label: "5:15@15",
    sl: 5,
    tp: 15,
    rr: "1:3",
    taken: 2695,
    exp: 2.01,
    wr: 51.3,
  },
  {
    label: "6:18@15",
    sl: 6,
    tp: 18,
    rr: "1:3",
    taken: 2692,
    exp: 2.16,
    wr: 52.7,
  },
  {
    label: "7:21@15",
    sl: 7,
    tp: 21,
    rr: "1:3",
    taken: 2688,
    exp: 2.231,
    wr: 53.6,
  },
  {
    label: "8:24@15",
    sl: 8,
    tp: 24,
    rr: "1:3",
    taken: 2687,
    exp: 2.304,
    wr: 54.3,
  },
  {
    label: "9:27@15",
    sl: 9,
    tp: 27,
    rr: "1:3",
    taken: 2681,
    exp: 2.327,
    wr: 54.7,
  },
  {
    label: "10:30@15",
    sl: 10,
    tp: 30,
    rr: "1:3",
    taken: 2680,
    exp: 2.28,
    wr: 54.9,
  },
  {
    label: "5:20@15",
    sl: 5,
    tp: 20,
    rr: "1:4",
    taken: 2692,
    exp: 2.09,
    wr: 50.5,
  },
  {
    label: "6:24@15",
    sl: 6,
    tp: 24,
    rr: "1:4",
    taken: 2688,
    exp: 2.18,
    wr: 52.0,
  },
  {
    label: "7:28@15",
    sl: 7,
    tp: 28,
    rr: "1:4",
    taken: 2685,
    exp: 2.2,
    wr: 53.1,
  },
  {
    label: "8:32@15",
    sl: 8,
    tp: 32,
    rr: "1:4",
    taken: 2684,
    exp: 2.275,
    wr: 53.9,
  },
  {
    label: "9:36@15",
    sl: 9,
    tp: 36,
    rr: "1:4",
    taken: 2679,
    exp: 2.217,
    wr: 54.2,
  },
  {
    label: "10:40@15",
    sl: 10,
    tp: 40,
    rr: "1:4",
    taken: 2677,
    exp: 2.2,
    wr: 54.6,
  },
  {
    label: "5:25@15",
    sl: 5,
    tp: 25,
    rr: "1:5",
    taken: 2690,
    exp: 2.13,
    wr: 50.1,
  },
  {
    label: "6:30@15",
    sl: 6,
    tp: 30,
    rr: "1:5",
    taken: 2686,
    exp: 2.175,
    wr: 51.8,
  },
  {
    label: "7:35@15",
    sl: 7,
    tp: 35,
    rr: "1:5",
    taken: 2685,
    exp: 2.14,
    wr: 52.8,
  },
  {
    label: "8:40@15",
    sl: 8,
    tp: 40,
    rr: "1:5",
    taken: 2682,
    exp: 2.2,
    wr: 53.6,
  },
  {
    label: "9:45@15",
    sl: 9,
    tp: 45,
    rr: "1:5",
    taken: 2677,
    exp: 2.216,
    wr: 54.1,
  },
  {
    label: "10:50@15",
    sl: 10,
    tp: 50,
    rr: "1:5",
    taken: 2677,
    exp: 2.234,
    wr: 54.5,
  },
];

const computed = strategies.map((s) => {
  const posSize = 1 / s.sl; // fraction of capital per 1% risk
  const capExp = s.exp * posSize; // expectancy as % of capital
  const winOnCap = (s.tp / s.sl) * 1; // win in % of capital
  const lossOnCap = -1; // loss always -1% of capital
  const totalSimple = capExp * s.taken;
  const posSizePct = posSize * 100;
  return {
    ...s,
    posSize,
    posSizePct,
    capExp,
    winOnCap,
    lossOnCap,
    totalSimple,
  };
});

const sortOptions = [
  { key: "totalSimple", label: "Total Return on Capital" },
  { key: "capExp", label: "Per-Trade Capital Expectancy" },
  { key: "exp", label: "Per-Trade Position Expectancy" },
  { key: "taken", label: "Trades Taken" },
  { key: "wr", label: "Win Rate" },
];

const rrFilters = ["All", "1:1", "1:2", "1:3", "1:4", "1:5"];

export default function App() {
  const [sortBy, setSortBy] = useState("totalSimple");
  const [riskPct, setRiskPct] = useState(1);
  const [startCap, setStartCap] = useState(100000);
  const [rrFilter, setRrFilter] = useState("All");

  const adjusted = computed.map((s) => {
    const posSize = riskPct / s.sl;
    const capExp = (s.exp * posSize) / 100;
    const totalSimple = capExp * s.taken * 100;
    const winOnCap = (s.tp / s.sl) * riskPct;
    const posSizePct = posSize * 100;
    const dollarReturn = (startCap * totalSimple) / 100;
    return {
      ...s,
      posSize,
      posSizePct,
      capExp: capExp * 100,
      winOnCap,
      lossOnCap: -riskPct,
      totalSimple,
      dollarReturn,
    };
  });

  const filtered =
    rrFilter === "All" ? adjusted : adjusted.filter((s) => s.rr === rrFilter);
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);

  const best = sorted[0];

  const fmt = (n, d = 2) => (n >= 0 ? `+${n.toFixed(d)}` : n.toFixed(d));
  const fmtD = (n) =>
    n >= 0
      ? `+$${n.toLocaleString("en", { maximumFractionDigits: 0 })}`
      : `-$${Math.abs(n).toLocaleString("en", { maximumFractionDigits: 0 })}`;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#0a0a0f",
        color: "#e0e0e0",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "4px",
          color: "#fff",
        }}
      >
        Capital-Adjusted Expectancy Analysis
      </h1>
      <p style={{ color: "#888", fontSize: "13px", marginBottom: "24px" }}>
        Risk-per-trade sizing: position = risk% ÷ SL% of capital → smaller SL =
        bigger position
      </p>

      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              color: "#888",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Risk per Trade
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0.5, 1, 1.5, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRiskPct(r)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderColor: riskPct === r ? "#6366f1" : "#333",
                  background: riskPct === r ? "#6366f1" : "#1a1a24",
                  color: riskPct === r ? "#fff" : "#aaa",
                }}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              color: "#888",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Starting Capital
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {[10000, 50000, 100000, 500000].map((c) => (
              <button
                key={c}
                onClick={() => setStartCap(c)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderColor: startCap === c ? "#6366f1" : "#333",
                  background: startCap === c ? "#6366f1" : "#1a1a24",
                  color: startCap === c ? "#fff" : "#aaa",
                }}
              >
                ${c / 1000}k
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              color: "#888",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            R:R Filter
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {rrFilters.map((f) => (
              <button
                key={f}
                onClick={() => setRrFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderColor: rrFilter === f ? "#6366f1" : "#333",
                  background: rrFilter === f ? "#6366f1" : "#1a1a24",
                  color: rrFilter === f ? "#fff" : "#aaa",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {best && (
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            border: "1px solid #2a2a4a",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            Best Strategy at {riskPct}% Risk
          </div>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div
                style={{ fontSize: "28px", fontWeight: 700, color: "#818cf8" }}
              >
                {best.label}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {best.rr} R:R
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Per-Trade on Capital
              </div>
              <div
                style={{ fontSize: "22px", fontWeight: 600, color: "#34d399" }}
              >
                {fmt(best.capExp, 3)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Total Return
              </div>
              <div
                style={{ fontSize: "22px", fontWeight: 600, color: "#34d399" }}
              >
                {fmt(best.totalSimple, 1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Dollar P&L (simple)
              </div>
              <div
                style={{ fontSize: "22px", fontWeight: 600, color: "#34d399" }}
              >
                {fmtD(best.dollarReturn)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Position Size
              </div>
              <div
                style={{ fontSize: "22px", fontWeight: 600, color: "#f0abfc" }}
              >
                {best.posSizePct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#888" }}>Sort by:</span>
        {sortOptions.map((o) => (
          <button
            key={o.key}
            onClick={() => setSortBy(o.key)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              background: sortBy === o.key ? "#6366f1" : "#1a1a24",
              color: sortBy === o.key ? "#fff" : "#888",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              {[
                "#",
                "Strategy",
                "R:R",
                "SL",
                "Pos Size",
                "Trades",
                "WR%",
                "Win on Cap",
                "Loss on Cap",
                "E(R) Position",
                "E(R) Capital",
                "Total Return",
                "Dollar P&L",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    color: "#666",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const isTop3 = i < 3;
              const bg = i % 2 === 0 ? "#0f0f18" : "#12121e";
              return (
                <tr
                  key={s.label}
                  style={{
                    background: bg,
                    borderLeft: isTop3
                      ? "3px solid #6366f1"
                      : "3px solid transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: isTop3 ? "#818cf8" : "#555",
                      fontWeight: isTop3 ? 700 : 400,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: isTop3 ? "#fff" : "#ccc",
                      fontFamily: "monospace",
                    }}
                  >
                    {s.label}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#888",
                    }}
                  >
                    {s.rr}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#f87171",
                    }}
                  >
                    {s.sl}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#f0abfc",
                    }}
                  >
                    {s.posSizePct.toFixed(1)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#aaa",
                    }}
                  >
                    {s.taken.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color:
                        s.wr >= 55
                          ? "#34d399"
                          : s.wr >= 50
                            ? "#fbbf24"
                            : "#f87171",
                    }}
                  >
                    {s.wr.toFixed(1)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#34d399",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmt(s.winOnCap, 2)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#f87171",
                      fontFamily: "monospace",
                    }}
                  >
                    {s.lossOnCap.toFixed(2)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#aaa",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmt(s.exp, 3)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#34d399",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {fmt(s.capExp, 3)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#34d399",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {fmt(s.totalSimple, 1)}%
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      color: "#34d399",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {fmtD(s.dollarReturn)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#1a1a24",
          borderRadius: "8px",
          border: "1px solid #2a2a3a",
        }}
      >
        <h3 style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>
          📐 How it works
        </h3>
        <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.8 }}>
          <div>
            <strong style={{ color: "#aaa" }}>Position Size</strong> = {riskPct}
            % ÷ SL% → e.g. {riskPct}% ÷ 6% SL ={" "}
            {((riskPct / 6) * 100).toFixed(1)}% of capital
          </div>
          <div>
            <strong style={{ color: "#aaa" }}>Win on Capital</strong> = TP% ÷
            SL% × {riskPct}% → e.g. 12% ÷ 6% × {riskPct}% ={" "}
            {((12 / 6) * riskPct).toFixed(1)}% of capital
          </div>
          <div>
            <strong style={{ color: "#aaa" }}>Loss on Capital</strong> = always
            -{riskPct}% (fixed risk)
          </div>
          <div>
            <strong style={{ color: "#aaa" }}>E(R) on Capital</strong> =
            Position Expectancy × ({riskPct}% ÷ SL%)
          </div>
          <div>
            <strong style={{ color: "#aaa" }}>Total Return</strong> = E(R) on
            Capital × Trades Taken (simple, non-compounded)
          </div>
          <div style={{ marginTop: "8px", color: "#f59e0b" }}>
            ⚠ These are simple (non-compounded) returns. Compounding would
            amplify significantly.
          </div>
        </div>
      </div>
    </div>
  );
}
