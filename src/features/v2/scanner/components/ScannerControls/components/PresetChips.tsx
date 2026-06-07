import { PRESET_OPTIONS } from "../../../lib/scannerOptions";
import type { ScannerPreset } from "../../../types";
import { OptionDropdown } from "./OptionDropdown";

type PresetChipsProps = {
  preset: ScannerPreset;
  onPresetChange: (value: ScannerPreset) => void;
};

export function PresetChips({ preset, onPresetChange }: PresetChipsProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 whitespace-nowrap font-mono text-[0.58rem] tracking-[0.12em] uppercase text-[oklch(0.42_0_0)]">
        Preset
      </span>
      <OptionDropdown
        label={preset}
        options={PRESET_OPTIONS}
        value={preset}
        onValueChange={onPresetChange}
      />
    </div>
  );
}
