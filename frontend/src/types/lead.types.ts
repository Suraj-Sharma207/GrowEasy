/**
 * Lead status enumeration from backend.
 */
export type CRMStatus = 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE';

/**
 * Lead entity interface — maps exactly to Prisma Lead model.
 */
export interface Lead {
  id: string;
  name: string;
  email: string | null;
  countryCode: string | null;
  mobileWithoutCountryCode: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  leadOwner: string | null;
  crmStatus: CRMStatus;
  crmNote: string | null;
  dataSource: string | null;
  possessionTime: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * KPI summary data for the leads dashboard.
 */
export interface LeadStatistics {
  totalLeads: number;
  successfullyImported: number;
  skippedRecords: number;
}
