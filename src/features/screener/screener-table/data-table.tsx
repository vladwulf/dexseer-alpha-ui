import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ScreenerDensity } from "../screener-buttons/ScreenerConfigs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  isLoading?: boolean;
  density?: ScreenerDensity;
  hideHeader?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting = [],
  onSortingChange,
  density = "compact",
  hideHeader = false,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    state: {
      sorting,
    },
    manualSorting: true, // Sorting is handled by the backend
    enableSortingRemoval: false, // Prevent clearing sort - only cycle between asc/desc
    getRowId: (row: TData) => {
      // Use symbol as the unique identifier for assets
      // This ensures React uses stable keys and better reconciliation
      if (typeof row === "object" && row !== null && "symbol" in row) {
        return (row as { symbol: string }).symbol;
      }
      // Fallback to index if symbol is not available
      return String((row as { id?: number }).id ?? Math.random());
    },
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        {!hideHeader && (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:underline"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ userSelect: "none" }}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() && header.column.getIsSorted() && (
                          <span style={{ color: "oklch(0.72 0.18 248)", fontSize: "0.65rem" }}>
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(density === "extended" ? "h-[440px]" : "h-14")}
                style={{ transition: "background 0.1s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "oklch(1 0 0 / 2.5%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(density === "extended" ? "py-4" : "py-2")}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: density === "extended" ? "0.8rem" : "0.72rem",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
