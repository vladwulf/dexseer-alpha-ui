import { Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DensityMode } from "../../../types";

type ActionButtonsProps = {
  density: DensityMode;
  onDensityChange: (value: DensityMode) => void;
};

export function ActionButtons({
  density: _density,
  onDensityChange: _onDensityChange,
}: ActionButtonsProps) {
  return (
    <>
      {/* <button
        type="button"
        onClick={() => onDensityChange("compact")}
        style={density === "compact" ? chipActive : chipBase}
      >
        Compact
      </button>
      <button
        type="button"
        onClick={() => onDensityChange("expanded")}
        style={density === "expanded" ? chipActive : chipBase}
      >
        Expanded
      </button> */}
      <button
        type="button"
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[4px] border border-transparent bg-transparent px-[9px] py-[3px] font-mono text-[0.7rem] font-medium tracking-[0.05em] text-[oklch(0.48_0_0)] transition-all duration-150",
        )}
      >
        <Filter size={11} />
        Filters
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[4px] border border-[oklch(0.72_0.18_248_/_30%)] bg-[oklch(0.72_0.18_248_/_12%)] px-[9px] py-[3px] font-mono text-[0.7rem] font-medium tracking-[0.05em] text-[oklch(0.72_0.18_248)] transition-all duration-150",
        )}
      >
        <Star size={11} />
        Save view
      </button>
    </>
  );
}
