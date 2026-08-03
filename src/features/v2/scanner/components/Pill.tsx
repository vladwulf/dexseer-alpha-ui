import { formatSigned } from "../lib/formatters";

export function Pill({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number | null;
  compact?: boolean;
}) {
  const size = compact
    ? "rounded px-1.5 py-0.5 text-[0.62rem]"
    : "rounded-md px-2 py-1 text-[0.7rem]";

  if (value === null) {
    return (
      <span
        className={`${size} border border-white/10 bg-white/[0.03] font-[var(--font-mono)] text-white/30`}
      >
        — {label}
      </span>
    );
  }

  const tone =
    value > 0
      ? "border-[#5dc887]/20 bg-[#5dc887]/10 text-[#5dc887]"
      : value < 0
        ? "border-[#e35561]/20 bg-[#e35561]/10 text-[#e35561]"
        : "border-white/10 bg-white/[0.03] text-white/45";

  return (
    <span className={`${size} border font-[var(--font-mono)] ${tone}`}>
      {formatSigned(value)} {label}
    </span>
  );
}
