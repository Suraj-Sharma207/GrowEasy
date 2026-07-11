import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client with enterprise-grade defaults.
 *
 * - staleTime: 5 minutes — avoids refetching fresh data on every mount
 * - retry: 2 — retries failed requests twice before showing error state
 * - refetchOnWindowFocus: false — prevents surprise refetches for enterprise UX
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
