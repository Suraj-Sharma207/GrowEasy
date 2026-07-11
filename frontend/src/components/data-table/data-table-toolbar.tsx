'use client';

import { Input } from '@/components/ui/input';
import { Search, Filter, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TABLE_MESSAGES } from '@/constants/table.constants';

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

/**
 * Table toolbar with premium search input and customizable filter slot.
 */
export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = TABLE_MESSAGES.searchPlaceholder,
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between py-2">
      {/* Search input */}
      <div className="relative w-full md:w-[350px] lg:w-[420px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 h-10 text-sm bg-card border-border/60 rounded-full shadow-sm"
        />
      </div>

      {/* Additional toolbar actions */}
      <div className="flex items-center gap-3">
        {children}
        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-xl shadow-sm bg-card">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filters
        </Button>
        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-xl shadow-sm bg-card">
          <Columns className="h-4 w-4 text-muted-foreground" />
          Columns
        </Button>
      </div>
    </div>
  );
}
