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
      className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[0.72rem] font-semibold tracking-[0.06em] transition ${
        variant === "primary"
          ? "bg-[#5b8ff9] text-white hover:bg-[#4a7fe8]"
          : "border border-white/10 bg-white/3 text-white/78 hover:bg-white/6"
      }`}
    >
      {icon}
      {children}
    </Button>
  );
}
