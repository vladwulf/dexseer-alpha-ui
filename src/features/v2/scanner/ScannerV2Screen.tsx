import { useMemo, useState } from "react";
import {
  BellPlus,
  BookmarkPlus,
  Circle,
  Clock3,
  Filter,
  Gauge,
  Search,
  Star,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndexChart } from "@/features/chart/IndexChart";
import type { OHLCVExtended } from "@/types/ohlcv";

type ScannerTimeframe = "5m" | "15m" | "1h" | "4h" | "1d";
type ScannerPreset =
  | "Momentum"
  | "Breakouts"
  | "Pullbacks"
  | "OI Expansion"
  | "Funding Extremes"
  | "Squeeze Candidates"
  | "BTC Decouplers"
  | "High RVOL";
type DensityMode = "compact" | "expanded";

type MarketStripItem = {
  symbol: string;
  price: string;
  change15m: number;
  change1h: number;
  change24h: number;
};

type ScannerAsset = {
  symbol: string;
  market: "PERP";
  price: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change4h: number;
  change24h: number;
  volume: string;
  rvol: number;
  oiDelta: number;
  funding: number;
  atrPercent: number;
  btcCorrelation: number;
  alertCount: number;
  setupLabel: string;
  setupScore: number;
  rankingReason: string;
  activeSetupSummary: string;
  btcRelativeBehavior: string;
  sessionEdge: string;
  bestHours: number[];
  sparkline: number[];
  chart: OHLCVExtended[];
  recentAlerts: Array<{
    timeframe: ScannerTimeframe;
    label: string;
    time: string;
  }>;
};

const MARKET_STRIP: MarketStripItem[] = [
  { symbol: "BTC", price: "67,412", change15m: 0.4, change1h: 1.2, change24h: 2.8 },
  { symbol: "ETH", price: "3,512", change15m: 0.2, change1h: 0.8, change24h: 1.9 },
  { symbol: "SOL", price: "178.42", change15m: 0.7, change1h: 2.6, change24h: 7.4 },
];

const PRESET_OPTIONS: ScannerPreset[] = [
  "Momentum",
  "Breakouts",
  "Pullbacks",
  "OI Expansion",
  "Funding Extremes",
  "Squeeze Candidates",
  "BTC Decouplers",
  "High RVOL",
];

const TIMEFRAME_OPTIONS: ScannerTimeframe[] = ["5m", "15m", "1h", "4h", "1d"];

const WATCHLIST_OPTIONS = ["All assets", "Core watchlist", "Breakout deck", "Muted off"];
const SORT_OPTIONS = [
  "Setup score",
  "Alert count",
  "24h momentum",
  "RVOL",
  "Funding",
  "BTC correlation",
];

const SCANNER_ASSETS: ScannerAsset[] = [
  {
    symbol: "DOGEUSDT",
    market: "PERP",
    price: 0.1842,
    change5m: 0.6,
    change15m: 1.4,
    change1h: 3.8,
    change4h: 5.2,
    change24h: 12.4,
    volume: "482M",
    rvol: 2.6,
    oiDelta: 14,
    funding: 0.012,
    atrPercent: 3.8,
    btcCorrelation: 0.42,
    alertCount: 3,
    setupLabel: "Breakout + OI Confirm",
    setupScore: 84,
    rankingReason: "1h breakout with 2.6x RVOL, open interest still building, funding not stretched.",
    activeSetupSummary: "1h breakout, RVOL 2.6x, OI +14%, funding still neutral.",
    btcRelativeBehavior: "Held bid during BTC chop and continued making higher intraday lows.",
    sessionEdge: "London to NY overlap drives 73% of the last 30 breakout continuations.",
    bestHours: [2, 4, 6, 8, 9, 12, 14, 16, 17, 15, 13, 10, 8, 6, 5, 4],
    sparkline: [24, 28, 27, 34, 33, 42, 48, 46, 54, 59, 57, 64],
    chart: buildMockKlines([0.171, 0.172, 0.1715, 0.175, 0.174, 0.178, 0.177, 0.181, 0.1805, 0.182, 0.1818, 0.1842]),
    recentAlerts: [
      { timeframe: "15m", label: "Breakout · daily high", time: "15:38" },
      { timeframe: "1h", label: "OI surge +12% in 1h", time: "15:22" },
      { timeframe: "1d", label: "RVOL > 2x sustained", time: "14:58" },
    ],
  },
  {
    symbol: "PEPEUSDT",
    market: "PERP",
    price: 0.0000114,
    change5m: 0.9,
    change15m: 2.6,
    change1h: 6.2,
    change4h: 9.8,
    change24h: 18.1,
    volume: "388M",
    rvol: 3.4,
    oiDelta: 22,
    funding: 0.041,
    atrPercent: 4.6,
    btcCorrelation: 0.31,
    alertCount: 4,
    setupLabel: "Short Squeeze Candidate",
    setupScore: 91,
    rankingReason: "Fast tape, high RVOL, and aggressive short covering across 15m and 1h windows.",
    activeSetupSummary: "Squeeze structure is still intact, but funding is moving toward crowded territory.",
    btcRelativeBehavior: "Strong positive drift even while BTC cooled after the prior impulse leg.",
    sessionEdge: "US morning has delivered the cleanest follow-through in 9 of the last 12 squeezes.",
    bestHours: [1, 2, 3, 4, 6, 8, 11, 13, 15, 16, 15, 12, 9, 7, 5, 3],
    sparkline: [18, 22, 30, 32, 40, 48, 56, 58, 62, 68, 72, 80],
    chart: buildMockKlines([0.0000094, 0.0000096, 0.0000098, 0.00001, 0.0000099, 0.0000103, 0.0000106, 0.0000108, 0.0000107, 0.000011, 0.0000112, 0.0000114]),
    recentAlerts: [
      { timeframe: "5m", label: "Perp squeeze ignition", time: "15:41" },
      { timeframe: "15m", label: "RVOL crossed 3x", time: "15:24" },
      { timeframe: "1h", label: "Funding expansion warning", time: "15:10" },
    ],
  },
  {
    symbol: "SOLUSDT",
    market: "PERP",
    price: 178.42,
    change5m: 0.1,
    change15m: 0.4,
    change1h: 1.1,
    change4h: 2.3,
    change24h: 4.8,
    volume: "1.2B",
    rvol: 1.3,
    oiDelta: 6,
    funding: 0.008,
    atrPercent: 2.9,
    btcCorrelation: 0.68,
    alertCount: 2,
    setupLabel: "VWAP Reclaim",
    setupScore: 68,
    rankingReason: "Cleaner structure than the headline momentum names and still early in the reclaim cycle.",
    activeSetupSummary: "Acceptance above intraday VWAP with steady OI and controlled funding.",
    btcRelativeBehavior: "Moving with BTC, but holding premium during dips.",
    sessionEdge: "Best continuation rate appears around the first two NY cash hours.",
    bestHours: [1, 1, 2, 3, 5, 8, 10, 11, 14, 13, 12, 10, 8, 7, 5, 3],
    sparkline: [30, 28, 34, 32, 40, 38, 46, 44, 50, 48, 56, 54],
    chart: buildMockKlines([168, 169, 170, 171, 170.4, 172.2, 173.4, 174.1, 173.8, 176.4, 177.1, 178.42]),
    recentAlerts: [
      { timeframe: "15m", label: "VWAP reclaim", time: "15:16" },
      { timeframe: "1h", label: "Trend continuation", time: "14:44" },
      { timeframe: "4h", label: "Relative strength vs BTC", time: "13:52" },
    ],
  },
  {
    symbol: "WIFUSDT",
    market: "PERP",
    price: 2.214,
    change5m: 0.4,
    change15m: 1.1,
    change1h: 2.6,
    change4h: 4.4,
    change24h: 9.8,
    volume: "124M",
    rvol: 2.1,
    oiDelta: 11,
    funding: 0.018,
    atrPercent: 4.1,
    btcCorrelation: 0.37,
    alertCount: 2,
    setupLabel: "Compression Breakout",
    setupScore: 78,
    rankingReason: "Vol expansion is beginning from a tight intraday base, with room before funding becomes a problem.",
    activeSetupSummary: "Range compression resolved higher, supported by fresh OI rather than pure short-covering.",
    btcRelativeBehavior: "Low correlation spike; can continue independently if meme beta stays active.",
    sessionEdge: "London close often marks the decision point for whether the move extends.",
    bestHours: [1, 2, 2, 3, 5, 6, 8, 10, 12, 12, 11, 9, 8, 6, 4, 3],
    sparkline: [14, 16, 17, 19, 18, 24, 28, 27, 32, 36, 39, 42],
    chart: buildMockKlines([1.92, 1.95, 1.97, 1.99, 1.98, 2.04, 2.08, 2.1, 2.09, 2.14, 2.18, 2.214]),
    recentAlerts: [
      { timeframe: "15m", label: "Compression break", time: "15:32" },
      { timeframe: "1h", label: "OI trend higher", time: "15:04" },
      { timeframe: "4h", label: "High beta watch", time: "14:37" },
    ],
  },
  {
    symbol: "ENAUSDT",
    market: "PERP",
    price: 0.7912,
    change5m: -0.1,
    change15m: -0.4,
    change1h: 0.6,
    change4h: -1.2,
    change24h: 2.1,
    volume: "64M",
    rvol: 0.9,
    oiDelta: 1,
    funding: -0.002,
    atrPercent: 3.3,
    btcCorrelation: 0.55,
    alertCount: 1,
    setupLabel: "Pullback Break",
    setupScore: 41,
    rankingReason: "Not yet actionable, but the structure is close enough to keep on deck.",
    activeSetupSummary: "Needs reclaim through local supply before the pullback thesis becomes tradeable.",
    btcRelativeBehavior: "Lagging BTC and still dependent on broader tape stabilization.",
    sessionEdge: "More reactive during Asia open than other sessions.",
    bestHours: [1, 1, 1, 2, 3, 5, 6, 7, 9, 9, 8, 7, 6, 5, 4, 2],
    sparkline: [24, 24, 25, 24, 23, 24, 25, 24, 24, 23, 22, 22],
    chart: buildMockKlines([0.812, 0.808, 0.804, 0.799, 0.801, 0.796, 0.794, 0.792, 0.788, 0.79, 0.789, 0.7912]),
    recentAlerts: [
      { timeframe: "1h", label: "Pullback into support", time: "14:26" },
      { timeframe: "4h", label: "Monitor reclaim trigger", time: "13:08" },
      { timeframe: "1d", label: "Watchlist retained", time: "11:45" },
    ],
  },
];

function buildMockKlines(closes: number[]): OHLCVExtended[] {
  const now = Date.now();

  return closes.map((close, index) => {
    const previousClose = closes[Math.max(index - 1, 0)] ?? close;
    const open = index === 0 ? close * 0.992 : previousClose;
    const high = Math.max(open, close) * 1.006;
    const low = Math.min(open, close) * 0.994;

    return {
      asset_id: 0,
      time: new Date(now - (closes.length - index) * 60 * 60 * 1000).toISOString(),
      open,
      high,
      low,
      close,
      analytics_updated_at: null,
      asset_volume: 1_000_000 + index * 25_000,
      quote_volume: 2_000_000 + index * 40_000,
      rel_vol_16p: null,
      rel_vol_96p: null,
      is_16p_breakout: false,
      is_16p_breakdown: false,
      is_96p_breakout: false,
      is_96p_breakdown: false,
      ema9: null,
      ema20: null,
      macd_signal: null,
      macd_line: null,
      macd_histogram: null,
    };
  });
}

const numberFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getChangeTone = (value: number) =>
  value > 0
    ? "text-[#5dc887]"
    : value < 0
      ? "text-[#e35561]"
      : "text-white/45";

const formatSigned = (value: number, suffix = "%") =>
  `${value > 0 ? "+" : ""}${numberFormat.format(value)}${suffix}`;

const formatPrice = (value: number) => {
  if (value < 0.001) {
    return value.toFixed(7);
  }
  if (value < 1) {
    return value.toFixed(4);
  }
  return numberFormat.format(value);
};

const Sparkline = ({ values }: { values: number[] }) => {
  const width = 88;
  const height = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-[88px] overflow-visible">
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};

const SessionBars = ({ values }: { values: number[] }) => (
  <div className="flex h-16 items-end gap-1">
    {values.map((value, index) => (
      <div
        key={`${value}-${index}`}
        className={`w-full rounded-t-[3px] ${index === 8 ? "bg-[oklch(0.72_0.18_248)]" : "bg-white/18"}`}
        style={{ height: `${Math.max(value * 4, 8)}px` }}
      />
    ))}
  </div>
);

export function ScannerV2Screen() {
  const [search, setSearch] = useState("");
  const [timeframe, setTimeframe] = useState<ScannerTimeframe>("1h");
  const [preset, setPreset] = useState<ScannerPreset>("Breakouts");
  const [watchlistFilter, setWatchlistFilter] = useState(WATCHLIST_OPTIONS[0]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [density, setDensity] = useState<DensityMode>("compact");
  const [minVolume, setMinVolume] = useState("50M+");
  const [selectedSymbol, setSelectedSymbol] = useState("DOGEUSDT");

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const assets = SCANNER_ASSETS.filter((asset) =>
      normalizedSearch.length === 0
        ? true
        : asset.symbol.toLowerCase().includes(normalizedSearch),
    );

    const sortedAssets = [...assets];

    switch (sortBy) {
      case "Alert count":
        sortedAssets.sort((left, right) => right.alertCount - left.alertCount);
        break;
      case "24h momentum":
        sortedAssets.sort((left, right) => right.change24h - left.change24h);
        break;
      case "RVOL":
        sortedAssets.sort((left, right) => right.rvol - left.rvol);
        break;
      case "Funding":
        sortedAssets.sort((left, right) => right.funding - left.funding);
        break;
      case "BTC correlation":
        sortedAssets.sort(
          (left, right) => Math.abs(left.btcCorrelation) - Math.abs(right.btcCorrelation),
        );
        break;
      default:
        sortedAssets.sort((left, right) => right.setupScore - left.setupScore);
        break;
    }

    return sortedAssets;
  }, [search, sortBy]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.symbol === selectedSymbol) ?? filteredAssets[0];

  return (
    <div
      className="min-h-screen bg-[#050505] text-white"
    >
      <div className="pb-8 pt-0 md:px-4 border">
        <div className="overflow-hidden border-white/8 bg-[#0a0a0a] shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <section className="border-b border-white/8 px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {MARKET_STRIP.map((item) => (
                  <div key={item.symbol} className="flex items-center gap-2">
                    <span className="font-[var(--font-display)] text-[1.35rem] font-semibold italic text-white">
                      {item.symbol}
                    </span>
                    <span className="font-[var(--font-mono)] text-base text-white/92">
                      {item.price}
                    </span>
                    <div className="flex items-center gap-1 text-[0.72rem] font-medium">
                      <Pill value={item.change15m} label="15m" />
                      <Pill value={item.change1h} label="1h" />
                      <Pill value={item.change24h} label="24h" />
                    </div>
                  </div>
                ))}

                <div className="hidden h-8 w-px bg-white/10 xl:block" />

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/45">breadth</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-6 w-1.5 rounded-full ${index < 6 ? "bg-[#5dc887]/80" : "bg-[#e35561]/65"}`}
                      />
                    ))}
                  </div>
                  <span className="font-[var(--font-mono)] text-sm text-white/78">62 / 38</span>
                </div>

                <StripMeta label="Alerts today" value="187" />
                <StripMeta label="UTC session" value="LDN" />
                <StripMeta label="Latency" value="5s" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                  <Gauge className="h-4 w-4 text-[#5dc887]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                    Live
                  </span>
                </div>
                <div className="font-[var(--font-mono)] text-sm text-white/55">
                  15:42:08 UTC
                </div>
              </div>
            </div>
          </section>

          <section className="sticky top-14 z-20 border-b border-white/8 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <label className="flex max-w-[320px] items-center gap-2 rounded-2xl">
                  <Search className="h-4 w-4 text-white/35" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="search symbol..."
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/30"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      onClick={() => setPreset(option)}
                      variant="outline"
                      size="sm"
                      className={`rounded-full font-[var(--font-display)] text-sm transition ${preset === option
                        ? "border-[oklch(0.72_0.18_248)] bg-[oklch(0.72_0.18_248/0.14)] text-[oklch(0.9_0.03_250)]"
                        : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.06]"
                        }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      onClick={() => setTimeframe(option)}
                      variant="outline"
                      size="sm"
                      className={`min-w-14 rounded-2xl text-sm font-semibold ${timeframe === option
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/72"
                        }`}
                    >
                      {option}
                    </Button>
                  ))}

                  <select
                    value={watchlistFilter}
                    onChange={(event) => setWatchlistFilter(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none"
                  >
                    {WATCHLIST_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>

                  <select
                    value={minVolume}
                    onChange={(event) => setMinVolume(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none"
                  >
                    {["10M+", "50M+", "100M+", "250M+"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDensity("compact")}
                    className={`rounded-full text-sm font-semibold ${density === "compact"
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/72"
                      }`}
                  >
                    Compact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDensity("expanded")}
                    className={`rounded-full text-sm font-semibold ${density === "expanded"
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/72"
                      }`}
                  >
                    Expanded
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/10 bg-white/[0.03] text-white/78"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[oklch(0.72_0.18_248/0.35)] bg-[oklch(0.72_0.18_248/0.12)] text-[oklch(0.9_0.03_250)]"
                  >
                    <Star className="h-4 w-4" />
                    Save view
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid min-h-[900px] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="overflow-hidden border-b border-white/8 xl:border-b-0 xl:border-r">
              <Table className="min-w-[1320px] border-collapse">
                <TableHeader className="bg-[#0d0d0d]">
                  <TableRow className="border-white/8 text-left text-white/40 hover:bg-transparent">
                    <HeaderCell>Symbol</HeaderCell>
                    <HeaderCell>Price</HeaderCell>
                    <HeaderCell>5m %</HeaderCell>
                    <HeaderCell>15m %</HeaderCell>
                    <HeaderCell>1h %</HeaderCell>
                    <HeaderCell>4h %</HeaderCell>
                    <HeaderCell>24h %</HeaderCell>
                    <HeaderCell>Volume</HeaderCell>
                    <HeaderCell>RVOL</HeaderCell>
                    <HeaderCell>OI Δ</HeaderCell>
                    <HeaderCell>Funding</HeaderCell>
                    <HeaderCell>ATR %</HeaderCell>
                    <HeaderCell>BTC corr</HeaderCell>
                    <HeaderCell>Alerts</HeaderCell>
                    <HeaderCell>Setup label</HeaderCell>
                    <HeaderCell>Score</HeaderCell>
                    <HeaderCell>Sparkline</HeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const isSelected = asset.symbol === selectedAsset.symbol;
                    return (
                      <TableRow
                        key={asset.symbol}
                        className={`border-b border-white/6 transition hover:bg-white/[0.03] ${isSelected ? "bg-[oklch(0.72_0.18_248/0.10)] shadow-[inset_2px_0_0_0_oklch(0.72_0.18_248)]" : ""
                          } ${density === "expanded" ? "h-20" : "h-14"}`}
                        onClick={() => setSelectedSymbol(asset.symbol)}
                      >
                        <TableCell className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Circle className="h-4 w-4 text-white/32" />
                            <div>
                              <div className="font-[var(--font-display)] text-[1.1rem] font-semibold italic leading-none text-white">
                                {asset.symbol.replace("USDT", "")}
                              </div>
                              <div className="mt-1 font-[var(--font-mono)] text-[0.72rem] uppercase tracking-[0.12em] text-white/28">
                                USDT
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <DataCell className="font-[var(--font-mono)]">{formatPrice(asset.price)}</DataCell>
                        <DataCell className={getChangeTone(asset.change5m)}>{formatSigned(asset.change5m)}</DataCell>
                        <DataCell className={getChangeTone(asset.change15m)}>{formatSigned(asset.change15m)}</DataCell>
                        <DataCell className={getChangeTone(asset.change1h)}>{formatSigned(asset.change1h)}</DataCell>
                        <DataCell className={getChangeTone(asset.change4h)}>{formatSigned(asset.change4h)}</DataCell>
                        <DataCell className={getChangeTone(asset.change24h)}>{formatSigned(asset.change24h)}</DataCell>
                        <DataCell>{asset.volume}</DataCell>
                        <DataCell className="font-semibold text-amber-300">{asset.rvol.toFixed(1)}x</DataCell>
                        <DataCell className={getChangeTone(asset.oiDelta)}>{formatSigned(asset.oiDelta)}</DataCell>
                        <DataCell className={getChangeTone(asset.funding)}>{formatSigned(asset.funding, "%")}</DataCell>
                        <DataCell>{numberFormat.format(asset.atrPercent)}</DataCell>
                        <DataCell>{asset.btcCorrelation.toFixed(2)}</DataCell>
                        <DataCell>{asset.alertCount}</DataCell>
                        <DataCell>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.74rem] font-medium text-white/76">
                            {asset.setupLabel}
                          </span>
                        </DataCell>
                        <DataCell>
                          <span
                            className={`inline-flex min-w-11 items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold ${asset.setupScore >= 80
                              ? "bg-[oklch(0.72_0.18_248)] text-white"
                              : asset.setupScore >= 60
                                ? "bg-amber-300 text-black"
                                : "bg-white/10 text-white/78"
                              }`}
                          >
                            {asset.setupScore}
                          </span>
                        </DataCell>
                        <DataCell className="text-white/62">
                          <Sparkline values={asset.sparkline} />
                        </DataCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {selectedAsset ? (
              <aside className="bg-[#090909] p-4 md:p-5">
                <Card className="gap-0 rounded-[24px] border-white/8 bg-[#0d0d0d] py-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
                  <CardContent className="px-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Circle className="mt-1 h-5 w-5 text-white/32" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-[var(--font-display)] text-[2rem] font-semibold italic leading-none text-white">
                              {selectedAsset.symbol}
                            </h2>
                            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                              {selectedAsset.market}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 font-[var(--font-mono)]">
                            <span className="text-2xl text-white">{formatPrice(selectedAsset.price)}</span>
                            <Pill value={selectedAsset.change1h} label="1h" />
                            <Pill value={selectedAsset.change24h} label="1d" />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full border-white/10 bg-white/[0.04] text-white/45"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                          Active setup
                        </p>
                        <span className="rounded-xl bg-[oklch(0.72_0.18_248)] px-3 py-2 text-xl font-bold text-white">
                          {selectedAsset.setupScore} / 100
                        </span>
                      </div>
                      <p className="mb-2 font-[var(--font-display)] text-[1.35rem] font-semibold text-white">
                        {selectedAsset.setupLabel}
                      </p>
                      <p className="text-sm leading-6 text-white/62">
                        {selectedAsset.activeSetupSummary}
                      </p>
                    </div>

                    <div className="mb-5">
                      <div className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                        <span>Price · {timeframe}</span>
                        <span>vol / OI / funding</span>
                      </div>
                      <div className="rounded-[20px] border border-white/8 bg-[#090909] p-4">
                        <div className="relative h-44 overflow-hidden rounded-[14px]">
                          <div className="pointer-events-none absolute inset-y-0 left-[60%] z-10 border-l-2 border-dashed border-[oklch(0.72_0.18_248/0.75)]" />
                          <span className="pointer-events-none absolute left-[58%] top-2 z-10 text-xs font-semibold text-[oklch(0.72_0.18_248)]">
                            brk 1h
                          </span>
                          <IndexChart
                            symbol={selectedAsset.symbol}
                            klines={selectedAsset.chart}
                            upColor="#5dc887"
                            downColor="#e35561"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <StatCard label="Volume 24h" value={selectedAsset.volume} tone="neutral" />
                      <StatCard label="OI 24h Δ" value={formatSigned(selectedAsset.oiDelta)} tone="positive" />
                      <StatCard label="Funding" value={formatSigned(selectedAsset.funding, "%")} tone="neutral" />
                      <StatCard label="ATR %" value={numberFormat.format(selectedAsset.atrPercent)} tone="neutral" />
                      <StatCard label="BTC corr 1h" value={selectedAsset.btcCorrelation.toFixed(2)} tone="neutral" />
                      <StatCard label="Why it ranked" value={`${selectedAsset.setupScore} pts`} tone="accent" />
                    </div>

                    <DetailBlock
                      label="Why it ranked"
                      body={selectedAsset.rankingReason}
                      icon={<Star className="h-4 w-4" />}
                    />
                    <DetailBlock
                      label="BTC-relative behavior"
                      body={selectedAsset.btcRelativeBehavior}
                      icon={<Volume2 className="h-4 w-4" />}
                    />

                    <div className="my-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                          Recent alerts
                        </p>
                        <Badge className="bg-amber-300 px-2 py-1 text-xs font-bold text-stone-900">
                          {selectedAsset.alertCount}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {selectedAsset.recentAlerts.map((alert) => (
                          <div
                            key={`${alert.label}-${alert.time}`}
                            className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="rounded-md border-white/10 px-2 py-1 text-xs font-semibold text-white/72">
                                {alert.timeframe}
                              </Badge>
                              <span className="text-sm text-white/66">{alert.label}</span>
                            </div>
                            <span className="font-[var(--font-mono)] text-xs text-white/38">
                              {alert.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/40">
                          Best trading hours · 30d
                        </p>
                        <Clock3 className="h-4 w-4 text-white/40" />
                      </div>
                      <SessionBars values={selectedAsset.bestHours} />
                      <p className="mt-3 text-sm leading-6 text-white/62">
                        {selectedAsset.sessionEdge}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <ActionButton icon={<BellPlus className="h-4 w-4" />} variant="primary">
                        Create alert later
                      </ActionButton>
                      <ActionButton icon={<BookmarkPlus className="h-4 w-4" />} variant="secondary">
                        Add to watchlist
                      </ActionButton>
                      <ActionButton icon={<Volume2 className="h-4 w-4" />} variant="secondary">
                        Mute symbol
                      </ActionButton>
                      <ActionButton icon={<Star className="h-4 w-4" />} variant="secondary">
                        Open full analysis
                      </ActionButton>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  const tone =
    value > 0
      ? "border-[#5dc887]/20 bg-[#5dc887]/10 text-[#5dc887]"
      : value < 0
        ? "border-[#e35561]/20 bg-[#e35561]/10 text-[#e35561]"
        : "border-white/10 bg-white/[0.03] text-white/45";

  return (
    <span
      className={`rounded-md border px-2 py-1 font-[var(--font-mono)] text-[0.7rem] ${tone}`}
    >
      {formatSigned(value)} {label}
    </span>
  );
}

function StripMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-xs uppercase tracking-[0.14em] text-white/38">{label}</span>
      <span className="font-[var(--font-mono)] text-sm text-white/78">{value}</span>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <TableHead className="px-4 py-4 font-medium">{children}</TableHead>;
}

function DataCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <TableCell className={`whitespace-nowrap px-4 py-3 text-sm ${className}`}>{children}</TableCell>;
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "accent";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "accent"
        ? "text-indigo-600"
        : "text-stone-800";

  return (
    <Card className="gap-0 rounded-xl border-white/8 bg-white/[0.03] px-3 py-2.5">
      <p className="text-xs uppercase tracking-[0.12em] text-white/38">{label}</p>
      <p className={`mt-1 font-[var(--font-mono)] text-lg ${toneClass}`}>{value}</p>
    </Card>
  );
}

function DetailBlock({
  label,
  body,
  icon,
}: {
  label: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/38">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm leading-6 text-white/62">{body}</p>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  variant,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant: "primary" | "secondary";
}) {
  return (
    <Button
      variant="outline"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${variant === "primary"
        ? "bg-[oklch(0.72_0.18_248)] text-white hover:bg-[oklch(0.67_0.16_248)]"
        : "border border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.06]"
        }`}
    >
      {icon}
      {children}
    </Button>
  );
}
