export function ScannerSidePanelSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-white/8 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-white/8 animate-pulse" />
            <div className="h-4 w-12 rounded bg-white/8 animate-pulse" />
            <div className="h-4 w-12 rounded bg-white/8 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 space-y-2">
        <div className="h-3 w-20 rounded bg-white/8 animate-pulse" />
        <div className="h-5 w-40 rounded bg-white/8 animate-pulse" />
        <div className="h-3 w-full rounded bg-white/8 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-white/8 animate-pulse" />
      </div>
      <div className="rounded-[20px] border border-white/8 bg-black p-4">
        <div className="h-44 rounded-[14px] bg-white/[0.03] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["price", "change", "volume", "rvol", "oi", "funding"].map((key) => (
          <div
            key={key}
            className="h-14 rounded-xl border border-white/8 bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
      <div className="space-y-3">
        {["summary", "risk"].map((key) => (
          <div
            key={key}
            className="h-16 rounded-xl border border-white/8 bg-white/[0.03] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
