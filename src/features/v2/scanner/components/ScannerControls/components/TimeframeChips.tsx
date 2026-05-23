import { TIMEFRAME_OPTIONS } from "../../../data/mockScannerData";
import type { ScannerTimeframe } from "../../../types";
import { chipActive, chipBase } from "./styles";

type TimeframeChipsProps = {
  timeframe: ScannerTimeframe;
  onTimeframeChange: (value: ScannerTimeframe) => void;
};

export function TimeframeChips({
  timeframe,
  onTimeframeChange,
}: TimeframeChipsProps) {
  return (
    <div
      className="flex items-center overflow-hidden rounded-[12px]"
      style={{ border: "1px solid oklch(1 0 0 / 10%)" }}
    >
      {TIMEFRAME_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onTimeframeChange(option)}
          style={{
            ...(timeframe === option ? chipActive : chipBase),
            borderRadius: 0,
            minWidth: "48px",
            border: "none",
            justifyContent: "center",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
