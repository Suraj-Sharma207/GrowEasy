'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers component — composes all context providers.
 * Uses useState to ensure a single QueryClient per session (SSR-safe).
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: 'var(--font-inter)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
