import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "accent";
}) {
  const toneClass =
    tone === "positive"
      ? "text-[#5dc887]"
      : tone === "accent"
        ? "text-[#5b8ff9]"
        : "text-white/85";

  return (
    <Card className="gap-0 rounded-xl border-white/8 bg-white/3 px-3 py-2.5">
      <p className="text-[0.58rem] uppercase tracking-widest text-white/38">
        {label}
      </p>
      <p className={`mt-1 font-[var(--font-mono)] text-base ${toneClass}`}>
        {value}
      </p>
    </Card>
  );
}
