'use client';

import { KpiCard } from '@/components/ui/kpi-card';
import { KPI_LABELS } from '../constants/leads.constants';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLeadStatistics } from '../hooks/useLeads';
import { Skeleton } from '@/components/ui/skeleton';

export function LeadsKpiSection() {
  const { data, isLoading } = useLeadStatistics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const stats = data.data;
  const successPercent = Math.round((stats.successfullyImported / Math.max(stats.totalLeads, 1)) * 100) || 0;
  const skippedPercent = Math.round((stats.skippedRecords / Math.max(stats.totalLeads, 1)) * 100) || 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        icon={Users}
        label={KPI_LABELS.totalLeads}
        value={stats.totalLeads}
        subtitle="All time leads"
      />
      <KpiCard
        icon={CheckCircle2}
        label={KPI_LABELS.successfullyImported}
        value={stats.successfullyImported}
        subtitle={
          <span className="text-muted-foreground"><span className="text-emerald-500 font-semibold">{successPercent}%</span> of total leads</span>
        }
        iconClassName="bg-emerald-500/10 text-emerald-600"
      />
      <KpiCard
        icon={AlertCircle}
        label={KPI_LABELS.skippedRecords}
        value={stats.skippedRecords}
        subtitle={
          <span className="text-muted-foreground"><span className="text-amber-500 font-semibold">{skippedPercent}%</span> of total leads</span>
        }
        iconClassName="bg-amber-500/10 text-amber-600"
      />
    </div>
  );
}
