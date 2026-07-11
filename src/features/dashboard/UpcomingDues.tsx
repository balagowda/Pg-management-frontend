import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatMonth } from '@/lib/formatDate';
import type { PaymentDto } from '@/api/types';

export function UpcomingDues({ dues }: { dues: PaymentDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming dues</CardTitle>
      </CardHeader>
      <CardContent>
        {dues.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing due this week" />
        ) : (
          <ul className="flex flex-col divide-y divide-divider">
            {dues.map((due) => (
              <li key={due.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <Link
                    to={`/guests/${due.guestId}`}
                    className="font-medium text-text-primary hover:text-primary"
                  >
                    {formatMonth(due.month)}
                  </Link>
                  <p className="text-xs text-text-secondary">
                    Due {formatCurrency(due.amountDue - due.amountPaid)}
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
