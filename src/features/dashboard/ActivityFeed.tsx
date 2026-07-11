import { Activity, UserPlus, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatRelativeShort } from '@/lib/formatDate';
import type { RecentActivityEntry } from '@/api/types';

export function ActivityFeed({ activity }: { activity: RecentActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" />
        ) : (
          <ul className="flex flex-col divide-y divide-divider">
            {activity.map((entry, i) => (
              <li key={i} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-variant">
                  {entry.type === 'PAYMENT_RECEIVED' ? (
                    <Wallet className="h-4 w-4 text-success" />
                  ) : (
                    <UserPlus className="h-4 w-4 text-info" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">
                    {entry.type === 'PAYMENT_RECEIVED'
                      ? `${entry.guestName} paid ${entry.amount != null ? formatCurrency(entry.amount) : ''}`
                      : `${entry.guestName} joined`}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatRelativeShort(entry.timestampMillis)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
