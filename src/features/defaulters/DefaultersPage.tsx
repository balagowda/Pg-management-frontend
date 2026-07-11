import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatCurrency';
import { useDefaulters } from './useDefaulters';

export function DefaultersPage() {
  const { data: defaulters, isLoading, isError, refetch } = useDefaulters();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-primary">Defaulters</h1>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && defaulters && defaulters.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="No defaulters"
          description="Every guest is caught up on rent."
        />
      )}

      {!isLoading && !isError && defaulters && defaulters.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>PG / Room</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Days overdue</TableHead>
              <TableHead>Outstanding</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defaulters.map((d) => (
              <TableRow key={d.guestId}>
                <TableCell>
                  <Link
                    to={`/guests/${d.guestId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {d.guestName}
                  </Link>
                </TableCell>
                <TableCell>
                  {d.pgName} · {d.roomNumber}
                </TableCell>
                <TableCell>{d.phone}</TableCell>
                <TableCell>
                  <Badge variant={d.daysOverdue > 7 ? 'error' : 'warning'}>{d.daysOverdue}d</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(d.outstandingAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
