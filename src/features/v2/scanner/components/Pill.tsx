import { formatSigned } from "../lib/formatters";

export function Pill({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null) {
    return (
      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-[var(--font-mono)] text-[0.7rem] text-white/30">
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
    <span
      className={`rounded-md border px-2 py-1 font-[var(--font-mono)] text-[0.7rem] ${tone}`}
    >
      {formatSigned(value)} {label}
    </span>
  );
}
