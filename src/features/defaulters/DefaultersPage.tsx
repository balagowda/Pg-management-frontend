import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import { ContactActionsRow } from '@/components/ContactActionsRow';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatMonth, currentMonthString } from '@/lib/formatDate';
import { reminderMessage } from '@/lib/whatsapp';
import { toErrorMessage } from '@/api/errors';
import { listPayments } from '@/api/endpoints/payments';
import type { DefaulterDto, PaymentDto } from '@/api/types';
import { RecordPaymentDialog } from '@/features/payments/RecordPaymentDialog';
import { useDefaulters } from './useDefaulters';

export function DefaultersPage() {
  const { data: defaulters, isLoading, isError, refetch } = useDefaulters();

  const [recordPayment, setRecordPayment] = useState<PaymentDto | undefined>();
  const [recordDefaulter, setRecordDefaulter] = useState<DefaulterDto | undefined>();
  const [loadingGuestId, setLoadingGuestId] = useState<string | undefined>();

  const currentMonthLabel = formatMonth(currentMonthString());

  async function handleRecord(defaulter: DefaulterDto) {
    setLoadingGuestId(defaulter.guestId);
    try {
      const payments = await listPayments({ guestId: defaulter.guestId });
      const outstanding = payments.find((p) => p.status !== 'PAID');
      if (!outstanding) {
        toast.error('No outstanding payment found for this guest');
        return;
      }
      setRecordPayment(outstanding);
      setRecordDefaulter(defaulter);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setLoadingGuestId(undefined);
    }
  }

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
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ContactActionsRow
                      phone={d.phone}
                      reminderMessage={reminderMessage(
                        d.guestName,
                        d.outstandingAmount,
                        currentMonthLabel,
                      )}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingGuestId === d.guestId}
                      onClick={() => handleRecord(d)}
                    >
                      {loadingGuestId === d.guestId ? 'Loading…' : 'Record'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <RecordPaymentDialog
        open={!!recordPayment}
        onOpenChange={(open) => {
          if (!open) {
            setRecordPayment(undefined);
            setRecordDefaulter(undefined);
          }
        }}
        payment={recordPayment}
        guestName={recordDefaulter?.guestName}
        guestPhone={recordDefaulter?.phone}
        pgName={recordDefaulter?.pgName}
      />
    </div>
  );
}
