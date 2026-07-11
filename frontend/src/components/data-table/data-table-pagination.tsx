'use client';

import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TABLE_CONFIG, TABLE_MESSAGES } from '@/constants/table.constants';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

/**
 * Table pagination controls — page size selector, navigation, and row counts.
 */
export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;

  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between py-2 px-1">
      {/* Row count info */}
      <p className="text-sm font-medium text-muted-foreground/80">
        {TABLE_MESSAGES.showingRows(from, to, totalRows)}
      </p>

      <div className="flex items-center gap-4 xl:gap-6 flex-wrap">
        {/* Page size selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground/80 whitespace-nowrap">
            {TABLE_MESSAGES.rowsPerPage}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-9 w-[70px] text-sm rounded-lg border-border/60 shadow-sm bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_CONFIG.pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-sm">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <span className="text-sm font-medium text-muted-foreground/80 whitespace-nowrap">
          {TABLE_MESSAGES.pageOf(pageIndex + 1, pageCount || 1)}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border/60 shadow-sm bg-card"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border/60 shadow-sm bg-card"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border/60 shadow-sm bg-card"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-border/60 shadow-sm bg-card"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
