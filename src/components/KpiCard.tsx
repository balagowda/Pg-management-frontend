import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  trendPercent?: number | null;
  className?: string;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trendPercent,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('flex h-full flex-col justify-between gap-4 p-5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-field bg-primary-container">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        {trendPercent != null && (
          <span
            className={cn(
              'text-xs font-semibold',
              trendPercent >= 0 ? 'text-success' : 'text-error',
            )}
          >
            {trendPercent >= 0 ? '+' : ''}
            {trendPercent.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
        <p className="mt-1 text-sm text-text-secondary">{label}</p>
        {subtitle && <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>}
      </div>
    </Card>
  );
}
