import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subtitle?: React.ReactNode;
  iconClassName?: string;
  className?: string;
}

/**
 * Reusable KPI card with icon, label, value, subtitle, and hover animation.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconClassName,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-border/40 bg-card p-4 md:p-5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
        'transition-all duration-300 ease-out hover:-translate-y-1',
        className
      )}
    >
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            'bg-primary/10 text-primary',
            'transition-colors duration-300 group-hover:bg-primary/15',
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col mt-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 mb-0.5">
            {label}
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatNumber(value)}
          </span>
          {subtitle && (
            <span className="text-sm font-medium text-muted-foreground mt-2">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
