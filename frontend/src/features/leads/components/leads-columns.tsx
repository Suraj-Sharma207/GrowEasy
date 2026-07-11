'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Lead } from '@/types/lead.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LEAD_STATUS_CONFIG } from '../constants/leads.constants';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

/**
 * Column definitions for the Leads table.
 * Strongly typed — each column maps to a Lead field.
 */
export const leadsColumns: ColumnDef<Lead, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Lead Name',
    minSize: 220,
    cell: ({ row }) => {
      const name = row.getValue<string>('name');
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      // Generate a stable color based on name length just for mock variety
      const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];
      const color = colors[name.length % colors.length];

      return (
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${color}`}>
            {initials}
          </div>
          <span className="font-semibold text-foreground text-[14px]">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    minSize: 220,
    cell: ({ row }) => (
      <span className="text-muted-foreground/80 font-medium">
        {row.getValue<string>('email')}
      </span>
    ),
  },
  {
    accessorKey: 'mobileWithoutCountryCode',
    header: 'Phone',
    minSize: 150,
    cell: ({ row }) => {
      const cc = row.original.countryCode;
      const phone = row.getValue<string>('mobileWithoutCountryCode');
      const displayPhone = cc && phone ? `${cc} ${phone}` : phone || '-';
      return (
        <span className="text-muted-foreground font-medium tabular-nums">
          {displayPhone}
        </span>
      );
    },
  },
  {
    accessorKey: 'company',
    header: 'Company',
    minSize: 180,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground/90">{row.getValue<string>('company')}</span>
    ),
  },
  {
    accessorKey: 'city',
    header: 'City',
    minSize: 130,
    cell: ({ row }) => (
      <span className="text-foreground/80 font-medium">{row.getValue<string>('city')}</span>
    ),
  },
  {
    accessorKey: 'crmStatus',
    header: 'Status',
    minSize: 170,
    cell: ({ row }) => {
      const status = row.getValue<Lead['crmStatus']>('crmStatus');
      
      const badgeStyles: Record<Lead['crmStatus'], string> = {
        GOOD_LEAD_FOLLOW_UP: 'bg-blue-50 text-blue-600 border-blue-200/60',
        DID_NOT_CONNECT: 'bg-slate-100 text-slate-600 border-slate-200',
        SALE_DONE: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        BAD_LEAD: 'bg-rose-50 text-rose-600 border-rose-200/60',
      };

      const labels: Record<Lead['crmStatus'], string> = {
        GOOD_LEAD_FOLLOW_UP: 'Good Lead - Follow Up',
        DID_NOT_CONNECT: 'Did Not Connect',
        SALE_DONE: 'Sale Done',
        BAD_LEAD: 'Bad Lead',
      }

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles[status]} uppercase tracking-wider`}>
          {labels[status]}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    minSize: 130,
    cell: ({ row }) => (
      <span className="text-muted-foreground/70 font-medium text-xs">
        {formatDate(row.getValue<string>('createdAt'))}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    minSize: 80,
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
