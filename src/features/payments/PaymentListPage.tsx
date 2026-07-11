import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReceiptIndianRupee } from 'lucide-react';
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
import { PaymentStatusChip } from '@/components/StatusChip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatMonth, currentMonthString } from '@/lib/formatDate';
import { computeEffectiveStatus } from '@/lib/effectiveStatus';
import type { PaymentDto } from '@/api/types';
import { usePgs } from '@/features/pgs/usePgs';
import { useGuests } from '@/features/guests/useGuests';
import { usePayments } from './usePayments';
import { RecordPaymentDialog } from './RecordPaymentDialog';

export function PaymentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') ?? currentMonthString();
  const pgId = searchParams.get('pgId') ?? '';

  const { data: pgs } = usePgs();
  const { data: guests } = useGuests();
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = usePayments({
    month,
    pgId: pgId || undefined,
  });

  const [recordTarget, setRecordTarget] = useState<PaymentDto | undefined>();

  function guestName(guestId: string) {
    return guests?.find((g) => g.id === guestId)?.name ?? '—';
  }
  function guestDueDay(guestId: string) {
    return guests?.find((g) => g.id === guestId)?.dueDay ?? 5;
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-primary">Payments</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="month"
            value={month}
            onChange={(e) => updateParam('month', e.target.value)}
            className="w-40"
          />
          <Select value={pgId || 'all'} onValueChange={(v) => updateParam('pgId', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All PGs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PGs</SelectItem>
              {(pgs ?? []).map((pg) => (
                <SelectItem key={pg.id} value={pg.id}>
                  {pg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && payments && payments.length === 0 && (
        <EmptyState
          icon={ReceiptIndianRupee}
          title="No payments for this month"
          description="Try a different month or PG filter."
        />
      )}

      {!isLoading && !isError && payments && payments.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const effective = computeEffectiveStatus(payment, guestDueDay(payment.guestId));
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{guestName(payment.guestId)}</TableCell>
                  <TableCell>{formatMonth(payment.month)}</TableCell>
                  <TableCell>{formatCurrency(payment.amountDue)}</TableCell>
                  <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                  <TableCell>
                    <PaymentStatusChip status={effective} />
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status !== 'PAID' && (
                      <Button size="sm" variant="outline" onClick={() => setRecordTarget(payment)}>
                        Record payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <RecordPaymentDialog
        open={!!recordTarget}
        onOpenChange={(open) => !open && setRecordTarget(undefined)}
        payment={recordTarget}
        guestName={recordTarget ? guestName(recordTarget.guestId) : undefined}
      />
    </div>
  );
}
