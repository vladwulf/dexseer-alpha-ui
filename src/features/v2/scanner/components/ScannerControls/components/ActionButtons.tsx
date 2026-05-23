import { Filter, Star } from "lucide-react";
import type { DensityMode } from "../../../types";
import { chipActive, chipBase } from "./styles";

type ActionButtonsProps = {
  density: DensityMode;
  onDensityChange: (value: DensityMode) => void;
};

export function ActionButtons({
  density,
  onDensityChange,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 2xl:flex-nowrap">
      <button
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
      </button>
      <button
        type="button"
        style={{
          ...chipBase,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Filter size={12} />
        Filters
      </button>
      <button
        type="button"
        style={{
          ...chipActive,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Star size={12} />
        Save view
      </button>
    </div>
  );
}
