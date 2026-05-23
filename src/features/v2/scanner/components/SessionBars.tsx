export function SessionBars({ values }: { values: number[] }) {
  return (
    <div className="flex h-12 items-end gap-1">
      {values.map((value, index) => (
        <div
          key={`${index === 8 ? "highlight" : "bar"}-${value}-${index === 8 ? "primary" : "default"}`}
          className={`w-full rounded-t-[3px] ${index === 8 ? "bg-[#5b8ff9]" : "bg-white/18"}`}
          style={{ height: `${Math.max(value * 4, 8)}px` }}
        />
      ))}
    </div>
  );
}
