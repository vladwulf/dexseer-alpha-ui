export function DetailBlock({
  label,
  body,
  icon,
}: {
  label: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-white/6 bg-white/[0.025] p-4">
      <div className="mb-2 flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/46">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-[0.8rem] leading-5 text-white/62">{body}</p>
    </div>
  );
}
