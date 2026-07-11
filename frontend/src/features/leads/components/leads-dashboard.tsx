'use client';

import { LeadsHeader } from './leads-header';
import { LeadsKpiSection } from './leads-kpi-section';
import { LeadsTable } from './leads-table';

/**
 * Leads Dashboard — orchestrates the full page layout:
 * Header → KPIs → Table
 */
export function LeadsDashboard() {
  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in min-h-0">
      <LeadsHeader />
      <LeadsKpiSection />
      <LeadsTable />
    </div>
  );
}
