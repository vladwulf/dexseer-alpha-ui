import { Gauge } from "lucide-react";
import type { MarketStripItem } from "../types";
import { Pill } from "./Pill";
import { StripMeta } from "./StripMeta";

export function ScannerMarketStrip({ items }: { items: MarketStripItem[] }) {
  return (
    <section className="border-b border-white/8 px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                <Pill value={item.change15m} label="15m" />
                <Pill value={item.change1h} label="1h" />
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
              {Array.from({ length: 10 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-6 w-1.5 rounded-full ${
                    index < 6 ? "bg-[#5dc887]/80" : "bg-[#e35561]/65"
                  }`}
                />
              ))}
            </div>
            <span className="font-[var(--font-mono)] text-[0.82rem] text-white/78">
              62 / 38
            </span>
          </div>

          <StripMeta label="Alerts today" value="187" />
          <StripMeta label="UTC session" value="LDN" />
          <StripMeta label="Latency" value="5s" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
            <Gauge className="h-4 w-4 text-[#5dc887]" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/55">
              Live
            </span>
          </div>
          <div className="font-[var(--font-mono)] text-[0.82rem] text-white/55">
            15:42:08 UTC
          </div>
        </div>
      </div>
    </section>
  );
}
