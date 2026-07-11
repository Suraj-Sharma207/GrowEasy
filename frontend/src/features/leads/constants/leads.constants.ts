import type { CRMStatus } from '@/types/lead.types';

export const LEAD_STATUS_CONFIG: Record<
  CRMStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  GOOD_LEAD_FOLLOW_UP: { label: 'Good Lead - Follow Up', variant: 'default' },
  DID_NOT_CONNECT: { label: 'Did Not Connect', variant: 'secondary' },
  SALE_DONE: { label: 'Sale Done', variant: 'outline' },
  BAD_LEAD: { label: 'Bad Lead', variant: 'destructive' },
} as const;

export const KPI_LABELS = {
  totalLeads: 'Total Leads',
  successfullyImported: 'Successfully Imported',
  skippedRecords: 'Skipped Records',
} as const;

export const LEADS_PAGE = {
  title: 'Leads',
  subtitle: 'AI-powered Lead Import & Management',
} as const;
