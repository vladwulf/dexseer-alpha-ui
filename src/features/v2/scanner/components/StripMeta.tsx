export function StripMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-[0.58rem] uppercase tracking-[0.18em] text-white/38">
        {label}
      </span>
      <span className="font-[var(--font-mono)] text-[0.82rem] text-white/78">
        {value}
      </span>
    </div>
  );
}
