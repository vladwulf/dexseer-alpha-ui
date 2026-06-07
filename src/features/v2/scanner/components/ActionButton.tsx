import { Button } from "@/components/ui/button";

export function ActionButton({
  children,
  icon,
  variant,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  variant: "primary" | "secondary";
}) {
  return (
    <Button
      variant="outline"
      className={`inline-flex h-8 items-center justify-center gap-2 rounded-[4px] px-[10px] py-0 text-[0.7rem] font-medium tracking-[0.05em] shadow-none transition ${
        variant === "primary"
          ? "border-[oklch(0.72_0.18_248/0.30)] bg-[oklch(0.72_0.18_248/0.12)] font-[var(--font-mono)] text-[oklch(0.72_0.18_248)] hover:bg-[oklch(0.72_0.18_248/0.14)]"
          : "border-white/8 bg-[#0d0d0d] font-[var(--font-mono)] text-white/48 hover:border-white/12 hover:bg-[#111] hover:text-white/70"
      }`}
    >
      {icon}
      {children}
    </Button>
  );
}
