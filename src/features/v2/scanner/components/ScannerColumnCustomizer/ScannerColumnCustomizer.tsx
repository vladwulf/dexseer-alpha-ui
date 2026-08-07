import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobileScanner } from "../../hooks/useIsMobileScanner";
import {
  DEFAULT_SCANNER_COLUMN_ORDER,
  getScannerColumnPreset,
  SCANNER_COLUMN_GROUPS,
  SCANNER_COLUMN_PRESETS,
  SCANNER_COLUMNS,
  type ScannerColumnDefinition,
} from "../../lib/scannerColumns";

type ScannerColumnCustomizerProps = {
  columnOrder: string[];
  onColumnOrderChange: (columnOrder: string[]) => void;
};

type ColumnCustomizerContentProps = ScannerColumnCustomizerProps;

function ColumnCustomizerContent({
  columnOrder,
  onColumnOrderChange,
}: ColumnCustomizerContentProps) {
  const [query, setQuery] = useState("");
  const visibleColumns = useMemo(
    () =>
      columnOrder.flatMap((id) => {
        const column = SCANNER_COLUMNS.find((item) => item.id === id);
        return column ? [column] : [];
      }),
    [columnOrder],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const isVisible = (id: string) => columnOrder.includes(id);
  const activePreset = getScannerColumnPreset(columnOrder);

  const toggleColumn = (column: ScannerColumnDefinition) => {
    if (column.locked) return;

    onColumnOrderChange(
      isVisible(column.id)
        ? columnOrder.filter((id) => id !== column.id)
        : [...columnOrder, column.id],
    );
  };

  const moveColumn = (id: string, direction: -1 | 1) => {
    const index = columnOrder.indexOf(id);
    const nextIndex = index + direction;
    if (index < 1 || nextIndex < 1 || nextIndex >= columnOrder.length) return;

    const nextOrder = [...columnOrder];
    [nextOrder[index], nextOrder[nextIndex]] = [
      nextOrder[nextIndex],
      nextOrder[index],
    ];
    onColumnOrderChange(nextOrder);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-white/8 px-5 py-4">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[0.6rem] font-semibold tracking-[0.13em] text-white/35 uppercase">
              Column layouts
            </h3>
            <span className="font-mono text-[0.6rem] text-white/35">
              {activePreset?.label ?? "Custom"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {SCANNER_COLUMN_PRESETS.map((preset) => {
              const selected = preset.id === activePreset?.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onColumnOrderChange(preset.columnOrder)}
                  className={cn(
                    "rounded-md border px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "border-[oklch(0.72_0.18_248_/_55%)] bg-[oklch(0.72_0.18_248_/_12%)]"
                      : "border-white/[0.08] bg-white/[0.025] hover:border-white/18 hover:bg-white/[0.055]",
                  )}
                >
                  <span className="block font-mono text-[0.68rem] font-medium text-white/80">
                    {preset.label}
                  </span>
                  <span className="mt-0.5 block text-[0.6rem] leading-snug text-white/38">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/35" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search metrics"
            className="h-9 border-white/10 bg-white/[0.035] pl-9 font-mono text-xs text-white placeholder:text-white/28"
          />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 divide-x divide-white/8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="min-h-0 overflow-y-auto px-3 py-3">
          {SCANNER_COLUMN_GROUPS.map((group) => {
            const columns = SCANNER_COLUMNS.filter(
              (column) =>
                column.group === group &&
                (!normalizedQuery ||
                  column.label.toLowerCase().includes(normalizedQuery)),
            );
            if (columns.length === 0) return null;

            return (
              <section key={group} className="mb-4 last:mb-0">
                <h3 className="px-2 pb-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.13em] text-white/35 uppercase">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {columns.map((column) => {
                    const selected = isVisible(column.id);
                    return (
                      <button
                        key={column.id}
                        type="button"
                        disabled={column.locked}
                        onClick={() => toggleColumn(column)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-mono text-xs transition-colors",
                          selected
                            ? "bg-[oklch(0.72_0.18_248_/_12%)] text-white"
                            : "text-white/58 hover:bg-white/[0.055] hover:text-white/85",
                          column.locked && "cursor-default",
                        )}
                      >
                        <span>{column.label}</span>
                        <span
                          className={cn(
                            "flex size-4 items-center justify-center rounded-[4px] border",
                            selected
                              ? "border-[oklch(0.72_0.18_248)] bg-[oklch(0.72_0.18_248)] text-[#07101d]"
                              : "border-white/18",
                          )}
                        >
                          {selected && (
                            <Check className="size-3" strokeWidth={3} />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <div className="min-h-0 overflow-y-auto bg-black/15 px-3 py-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="font-mono text-[0.6rem] font-semibold tracking-[0.13em] text-white/35 uppercase">
              Visible columns
            </h3>
            <span className="font-mono text-[0.62rem] text-white/35">
              {visibleColumns.length}
            </span>
          </div>
          <div className="space-y-1">
            {visibleColumns.map((column, index) => (
              <div
                key={column.id}
                className="flex items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/72">
                  {column.label}
                </span>
                {column.locked ? (
                  <span className="px-1 font-mono text-[0.58rem] tracking-wide text-white/28 uppercase">
                    Fixed
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      aria-label={`Move ${column.label} left`}
                      disabled={index === 1}
                      onClick={() => moveColumn(column.id, -1)}
                      className="rounded p-1 text-white/35 hover:bg-white/8 hover:text-white disabled:opacity-25"
                    >
                      <ArrowLeft className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${column.label} right`}
                      disabled={index === visibleColumns.length - 1}
                      onClick={() => moveColumn(column.id, 1)}
                      className="rounded p-1 text-white/35 hover:bg-white/8 hover:text-white disabled:opacity-25"
                    >
                      <ArrowRight className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hide ${column.label}`}
                      onClick={() => toggleColumn(column)}
                      className="rounded p-1 text-white/35 hover:bg-white/8 hover:text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/8 px-5 py-3">
        <p className="font-mono text-[0.62rem] text-white/32">
          Changes apply instantly
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onColumnOrderChange(DEFAULT_SCANNER_COLUMN_ORDER)}
          className="h-7 gap-1.5 px-2 font-mono text-[0.65rem] text-white/55 hover:bg-white/7 hover:text-white"
        >
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export function ScannerColumnCustomizer(props: ScannerColumnCustomizerProps) {
  const isMobile = useIsMobileScanner();
  const trigger = (
    <button
      type="button"
      className="inline-flex h-[26px] cursor-pointer items-center gap-1.5 rounded-[4px] border border-white/8 bg-[#0d0d0d] px-2 font-mono text-[0.65rem] font-medium tracking-[0.05em] text-white/55 transition-colors hover:border-white/15 hover:text-white"
    >
      <SlidersHorizontal className="size-3" />
      <span className="hidden sm:inline">Columns</span>
      <span className="text-white/32">{props.columnOrder.length}</span>
    </button>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="flex h-[82dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="border-b border-white/8 px-5 py-4 text-left">
            <SheetTitle className="font-[var(--font-display)] text-base italic text-white">
              Columns
            </SheetTitle>
            <SheetDescription className="font-mono text-[0.68rem] text-white/42">
              Build the scanner view around your setup.
            </SheetDescription>
          </SheetHeader>
          <ColumnCustomizerContent {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex h-[min(680px,82vh)] max-w-3xl flex-col gap-0 overflow-hidden border-white/10 bg-[#0d0d0d] p-0">
        <DialogHeader className="border-b border-white/8 px-5 py-4 text-left">
          <DialogTitle className="font-[var(--font-display)] text-base italic text-white">
            Columns
          </DialogTitle>
          <DialogDescription className="font-mono text-[0.68rem] text-white/42">
            Build the scanner view around your setup.
          </DialogDescription>
        </DialogHeader>
        <ColumnCustomizerContent {...props} />
      </DialogContent>
    </Dialog>
  );
}
