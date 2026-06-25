import { cn } from "@/lib/utils";
import { TIMEFRAME_OPTIONS } from "../../../lib/scannerOptions";
import type { ScannerTimeframe } from "../../../types";

type TimeframeChipsProps = {
  timeframe: ScannerTimeframe;
  onTimeframeChange: (value: ScannerTimeframe) => void;
};

export function TimeframeChips({
  timeframe,
  onTimeframeChange,
}: TimeframeChipsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden shrink-0 whitespace-nowrap font-mono text-[0.58rem] tracking-[0.12em] uppercase text-[oklch(0.42_0_0)] md:block">
        Timeframe
      </span>
      <div className="flex items-center gap-0.5">
        {TIMEFRAME_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onTimeframeChange(option)}
            className={cn(
              "flex min-w-[42px] cursor-pointer justify-center whitespace-nowrap rounded-[4px] border border-transparent bg-transparent px-[9px] py-[3px] font-mono text-[0.7rem] font-medium tracking-[0.05em] text-[oklch(0.48_0_0)] transition-all duration-150",
              timeframe === option &&
                "border-[oklch(0.72_0.18_248_/_30%)] bg-[oklch(0.72_0.18_248_/_12%)] text-[oklch(0.72_0.18_248)]",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
