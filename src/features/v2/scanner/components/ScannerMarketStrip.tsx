import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MarketStripItem } from "../types";
import { Pill } from "./Pill";

type ScannerMarketStripProps = {
  breadth?: {
    gainers: number;
    losers: number;
    unchanged: number;
    ratio: string;
  };
  items: MarketStripItem[];
  updatedAt?: string | null;
};

type SessionState = "premarket" | "market" | "afterhours" | "closed";
type SessionWindow = readonly [number, number, number, number];
type Hub = {
  label: string;
  tz: string;
  pre: SessionWindow;
  market: readonly SessionWindow[];
  post: readonly SessionWindow[];
};

const HUBS: readonly Hub[] = [
  {
    label: "NY",
    tz: "America/New_York",
    pre: [4, 0, 9, 30],
    market: [[9, 30, 16, 0]],
    post: [[16, 0, 20, 0]],
  },
  {
    label: "LDN",
    tz: "Europe/London",
    pre: [7, 50, 8, 0],
    market: [[8, 0, 16, 30]],
    post: [],
  },
  {
    label: "TKY",
    tz: "Asia/Tokyo",
    pre: [8, 0, 9, 0],
    market: [
      [9, 0, 11, 30],
      [12, 30, 15, 30],
    ],
    post: [],
  },
] as const;

function toMinutes([startH, startM, endH, endM]: SessionWindow) {
  return {
    start: startH * 60 + startM,
    end: endH * 60 + endM,
  };
}

function getSessionState(
  tz: string,
  pre: SessionWindow,
  market: readonly SessionWindow[],
  post: readonly SessionWindow[],
  now: Date,
): SessionState {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: tz,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const time = h * 60 + m;
  const { start: preStart, end: preEnd } = toMinutes(pre);

  if (
    market.some((session) => {
      const { start, end } = toMinutes(session);
      return time >= start && time < end;
    })
  ) {
    return "market";
  }

  if (time >= preStart && time < preEnd) return "premarket";
  if (
    post.some((session) => {
      const { start, end } = toMinutes(session);
      return time >= start && time < end;
    })
  ) {
    return "afterhours";
  }
  return "closed";
}

const SESSION_COLORS: Record<
  SessionState,
  { label: string; dot: string; glow: string }
> = {
  market: {
    label: "text-[#4ade80]",
    dot: "bg-[#4ade80]",
    glow: "0 0 6px #4ade80/40",
  },
  premarket: {
    label: "text-[#facc15]",
    dot: "bg-[#facc15]",
    glow: "0 0 6px #facc15/40",
  },
  afterhours: {
    label: "text-[#f59e0b]",
    dot: "bg-[#f59e0b]",
    glow: "0 0 6px #f59e0b/40",
  },
  closed: { label: "text-white/35", dot: "bg-white/20", glow: "none" },
};

function formatHubTime(tz: string, now: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(now);
}

function fmt(t: readonly [number, number]) {
  return `${String(t[0]).padStart(2, "0")}:${String(t[1]).padStart(2, "0")}`;
}

function formatWindow([startH, startM, endH, endM]: SessionWindow) {
  return `${fmt([startH, startM])}–${fmt([endH, endM])}`;
}

function tooltipText(
  label: string,
  state: SessionState,
  pre: SessionWindow,
  market: readonly SessionWindow[],
  post: readonly SessionWindow[],
) {
  const marketRange = market.map(formatWindow).join(", ");
  const postRange = post.map(formatWindow).join(", ");

  if (state === "market") return `${label} Market · ${marketRange}`;
  if (state === "premarket") return `${label} Premarket · ${formatWindow(pre)}`;
  if (state === "afterhours") return `${label} After Hours · ${postRange}`;
  return postRange
    ? `${label} Closed · Premarket ${formatWindow(pre)} · After Hours ${postRange}`
    : `${label} Closed · Premarket ${formatWindow(pre)}`;
}

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) return "Live";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(updatedAt));
}

export function ScannerMarketStrip({
  breadth,
  items,
  updatedAt,
}: ScannerMarketStripProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const gainers = breadth?.gainers ?? 0;
  const losers = breadth?.losers ?? 0;
  const breadthBars = Math.max(
    0,
    Math.min(10, Math.round((gainers / Math.max(gainers + losers, 1)) * 10)),
  );

  return (
    <section className="border-b border-white/8 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-3 md:gap-6">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {items.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2">
              <span className="[font-family:var(--font-display)] text-[0.88rem] font-bold italic text-white">
                {item.symbol}
              </span>
              <span className="font-[var(--font-mono)] text-[0.82rem] text-white/92">
                {item.price}
              </span>
              <div className="flex items-center gap-1 text-[0.72rem] font-medium">
                {/* <Pill value={item.change15m} label="15m" />
                <Pill value={item.change1h} label="1h" /> */}
                <Pill value={item.change24h} label="24h" />
              </div>
            </div>
          ))}

          <div className="hidden h-8 w-px bg-white/10 xl:block" />

          <div className="flex items-center gap-3">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-white/45">
              breadth
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, index) => index).map((index) => (
                <span
                  key={`breadth-${index < 6 ? "up" : "down"}-${index}`}
                  className={`h-6 w-1.5 ${
                    index < breadthBars ? "bg-[#79c68c]/80" : "bg-[#e35561]/65"
                  }`}
                />
              ))}
            </div>
            <span className="font-[var(--font-mono)] text-[0.82rem] text-white/78">
              {breadth?.ratio ?? "- / -"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <TooltipProvider delayDuration={200}>
            {HUBS.map((hub) => {
              const state = getSessionState(
                hub.tz,
                hub.pre,
                hub.market,
                hub.post,
                now,
              );
              const colors = SESSION_COLORS[state];
              return (
                <Tooltip key={hub.label}>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default items-center gap-1.5 font-[var(--font-mono)] text-[0.7rem]">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            state === "market"
                              ? "#4ade80"
                              : state === "premarket"
                                ? "#facc15"
                                : state === "afterhours"
                                  ? "#f59e0b"
                                : "oklch(1 0 0 / 20%)",
                          boxShadow:
                            state !== "closed"
                              ? `0 0 5px ${
                                  state === "market"
                                    ? "oklch(0.72 0.25 145 / 50%)"
                                    : state === "premarket"
                                      ? "oklch(0.78 0.2 85 / 50%)"
                                      : "oklch(0.75 0.18 60 / 50%)"
                                }`
                              : "none",
                        }}
                      />
                      <span className={colors.label}>{hub.label}</span>
                      <span className="text-white/80">
                        {formatHubTime(hub.tz, now)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    {tooltipText(
                      hub.label,
                      state,
                      hub.pre,
                      hub.market,
                      hub.post,
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5 font-[var(--font-mono)] text-[0.7rem]">
            <span className="text-white/45">Local</span>
            <span className="inline-block w-28 text-right text-[0.82rem] text-white/55">
              {formatUpdatedAt(updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
