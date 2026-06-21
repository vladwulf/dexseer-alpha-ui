import { ChevronDown, Filter, RefreshCw, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DensityMode, RefreshInterval } from "../../../types";

const refreshIntervals: { value: RefreshInterval; label: string }[] = [
  { value: "manual", label: "Off" },
  { value: "live", label: "Live" },
];

type ActionButtonsProps = {
  density: DensityMode;
  isRefreshing: boolean;
  refreshInterval: RefreshInterval;
  onDensityChange: (value: DensityMode) => void;
  onManualRefresh: () => void;
  onRefreshIntervalChange: (value: RefreshInterval) => void;
};

export function ActionButtons({
  density: _density,
  isRefreshing,
  refreshInterval,
  onDensityChange: _onDensityChange,
  onManualRefresh,
  onRefreshIntervalChange,
}: ActionButtonsProps) {
  const selectedRefreshLabel =
    refreshIntervals.find((interval) => interval.value === refreshInterval)
      ?.label ?? refreshInterval;

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
      <div className="flex items-center gap-2">
        <span className="shrink-0 whitespace-nowrap font-mono text-[0.58rem] tracking-[0.12em] uppercase text-[oklch(0.42_0_0)]">
          Refresh
        </span>
        <button
          type="button"
          onClick={onManualRefresh}
          aria-label="Refresh"
          className="inline-flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] border border-[oklch(1_0_0_/_8%)] bg-[#0d0d0d] text-[oklch(0.48_0_0)] transition-colors duration-150"
        >
          <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-[26px] cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-[4px] border px-[8px] font-mono text-[0.68rem] font-medium tracking-[0.05em] transition-all duration-150",
                refreshInterval !== "manual"
                  ? "border-[oklch(0.72_0.18_248_/_30%)] bg-[oklch(0.72_0.18_248_/_10%)] text-[oklch(0.72_0.18_248)]"
                  : "border-[oklch(1_0_0_/_8%)] bg-[#0d0d0d] text-[oklch(0.48_0_0)]",
              )}
            >
              {selectedRefreshLabel}
              <ChevronDown size={10} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuLabel className="font-mono text-[0.65rem] tracking-[0.1em]">
              Live Updates
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={refreshInterval}
              onValueChange={(value) =>
                onRefreshIntervalChange(value as RefreshInterval)
              }
            >
              {refreshIntervals.map((interval) => (
                <DropdownMenuRadioItem
                  key={interval.value}
                  value={interval.value}
                  className="font-mono text-[0.7rem]"
                >
                  {interval.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
