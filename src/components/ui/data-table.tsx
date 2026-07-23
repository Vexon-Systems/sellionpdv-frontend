import { type ReactNode, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  search?: { column: string; placeholder: string };
  pageSize?: number;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  enablePagination?: boolean;
  getRowClassName?: (row: TData) => string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  search,
  pageSize = 10,
  className,
  header,
  footer,
  isLoading = false,
  enablePagination = true,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // TanStack Table expõe handlers dinâmicos; o React Compiler deve ignorar este hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  const hasMultiplePages = enablePagination && table.getPageCount() > 1;

  return (
    <section className={cn("overflow-hidden rounded-xl border bg-surface-raised shadow-card", className)}>
      {header}

      {search && (
        <div className="flex items-center border-b px-4 py-3 md:px-5">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={search.placeholder}
              className="h-9 border-transparent bg-surface-sunken pl-9 shadow-none focus-visible:border-input focus-visible:bg-surface-raised"
              aria-label={search.placeholder}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto px-3 md:px-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {table.getFlatHeaders().map((headerItem) => (
                <TableHead
                  key={headerItem.id}
                  className={cn(
                    "h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    headerItem.id === "acoes" && "text-right",
                  )}
                >
                  {headerItem.isPlaceholder
                    ? null
                    : headerItem.column.getCanSort()
                      ? (
                        <button
                          type="button"
                          onClick={headerItem.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {flexRender(headerItem.column.columnDef.header, headerItem.getContext())}
                          {headerItem.column.getIsSorted() === "asc" ? (
                            <ChevronUp size={14} />
                          ) : headerItem.column.getIsSorted() === "desc" ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} className="opacity-45" />
                          )}
                        </button>
                      )
                      : flexRender(headerItem.column.columnDef.header, headerItem.getContext())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                  Carregando registros...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={cn("h-15", getRowClassName?.(row.original))}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {footer ?? (hasMultiplePages && (
        <div className="flex flex-col items-center justify-between gap-3 border-t bg-surface-sunken/40 px-4 py-3 text-sm sm:flex-row md:px-5">
          <p className="text-muted-foreground">{table.getFilteredRowModel().rows.length} registros</p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
            <Button type="button" variant="outline" size="icon" className="size-8 rounded-full" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior">
              <ChevronLeft size={16} />
            </Button>
            <Button type="button" variant="outline" size="icon" className="size-8 rounded-full" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Próxima página">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
