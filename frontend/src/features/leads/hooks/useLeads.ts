import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, GetLeadsParams } from '../api/leads.api';

export const LEADS_QUERY_KEY = 'leads';

export function useLeads(params: GetLeadsParams) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, params],
    queryFn: () => leadsApi.getLeads(params),
  });
}

export function useLeadStatistics() {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, 'statistics'],
    queryFn: () => leadsApi.getStatistics(),
  });
}

export function useAnalyzeCsv() {
  return useMutation({
    mutationFn: (file: File) => leadsApi.analyzeCsv(file),
  });
}

export function useConfirmImport() {
  return useMutation({
    mutationFn: (importId: string) => leadsApi.confirmImport(importId),
  });
}

export function useImportSession(importId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, 'import-session', importId],
    queryFn: () => leadsApi.getImportSession(importId),
    enabled: !!importId && enabled,
    refetchInterval: (query) => {
      // @ts-ignore
      const res = query.state.data;
      if (res && res.success && res.data) {
        const status = res.data.status;
        if (status === 'COMPLETED') {
          // Refresh leads list and dashboard stats once complete!
          queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
          return false;
        }
        if (status === 'FAILED' || status === 'EXPIRED') {
          return false;
        }
      }
      return 300; // poll every 300ms for snappier progress reporting
    },
  });
}
