'use client';

import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import { TABLE_CONFIG } from '@/constants/table.constants';
import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  
  // Manual Pagination Props
  pageCount?: number;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (updater: import('@tanstack/react-table').Updater<PaginationState>) => void;
  manualPagination?: boolean;
}

/**
 * Enterprise-grade data table built on TanStack Table.
 * Features: sticky header, pagination, search, loading skeleton, empty state.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records to display yet.',
  toolbar,
  pageCount,
  rowCount,
  pagination: externalPagination,
  onPaginationChange: externalOnPaginationChange,
  manualPagination = false,
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_CONFIG.defaultPageSize,
  });

  const pagination = externalPagination ?? internalPagination;
  const setPagination = externalOnPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    pageCount,
    rowCount,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Toolbar */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      >
        {toolbar}
      </DataTableToolbar>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/40 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <Table wrapperClassName="flex-1 overflow-auto min-h-0">
          <TableHeader className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/30 hover:bg-muted/30 border-b border-border/60"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                        'sticky top-0 bg-muted/80 backdrop-blur-md z-10 shadow-[0_1px_0_0_var(--color-border)]'
                      )}
                      style={{
                        minWidth: header.column.columnDef.minSize,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                /* Loading skeleton rows */
                Array.from({ length: TABLE_CONFIG.defaultPageSize }).map(
                  (_, rowIdx) => (
                    <TableRow key={`skeleton-${rowIdx}`}>
                      {columns.map((_, colIdx) => (
                        <TableCell key={`skeleton-${rowIdx}-${colIdx}`} className="px-4 py-3">
                          <Skeleton className="h-4 w-full rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                /* Empty state */
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-[400px] text-center"
                  >
                    <EmptyState
                      icon={Database}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

      </div>

      {/* Floating Pagination */}
      {!isLoading && data.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-2 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-4 py-1.5">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
