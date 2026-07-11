export const TABLE_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 30, 50] as readonly number[],
  stickyHeaderHeight: 48,
  rowHeight: 52,
  minColumnWidth: 100,
} as const;

export const TABLE_MESSAGES = {
  noResults: 'No results found',
  noData: 'No data available',
  loading: 'Loading data...',
  error: 'Failed to load data',
  searchPlaceholder: 'Search...',
  rowsPerPage: 'Rows per page',
  pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
  showingRows: (from: number, to: number, total: number) =>
    `Showing ${from}-${to} of ${total}`,
} as const;
