import { PRESET_OPTIONS } from "../../../data/mockScannerData";
import type { ScannerPreset } from "../../../types";
import { chipActive, chipBase } from "./styles";

type PresetChipsProps = {
  preset: ScannerPreset;
  onPresetChange: (value: ScannerPreset) => void;
};

export function PresetChips({ preset, onPresetChange }: PresetChipsProps) {
  return (
    <div className="hide-scrollbar flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
      {PRESET_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPresetChange(option)}
          style={preset === option ? chipActive : chipBase}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
