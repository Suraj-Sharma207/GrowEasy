'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { leadsColumns } from './leads-columns';
import { useLeads } from '../hooks/useLeads';
import { PaginationState } from '@tanstack/react-table';

export function LeadsTable() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounce search by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data, isLoading } = useLeads({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
  });

  return (
    <DataTable
      columns={leadsColumns}
      data={data?.data.items || []}
      isLoading={isLoading}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search leads by name, email, or company..."
      emptyTitle="No leads found"
      emptyDescription={debouncedSearch ? "No records matched your search." : "Import your first leads to get started."}
      manualPagination
      pageCount={data?.data.pagination.pages || -1}
      rowCount={data?.data.pagination.total || 0}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}
