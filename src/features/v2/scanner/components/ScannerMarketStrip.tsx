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

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) return "Live";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(updatedAt));
}

export function ScannerMarketStrip({
  breadth,
  items,
  updatedAt,
}: ScannerMarketStripProps) {
  const breadthBars = Math.max(
    0,
    Math.min(
      10,
      Math.round(
        ((breadth?.gainers ?? 6) /
          Math.max((breadth?.gainers ?? 6) + (breadth?.losers ?? 4), 1)) *
          10,
      ),
    ),
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
              {breadth?.ratio ?? "62 / 38"}
            </span>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <div className="font-[var(--font-mono)] text-[0.82rem] text-white/55">
            {formatUpdatedAt(updatedAt)}
          </div>
        </div>
      </div>
    </section>
  );
}
