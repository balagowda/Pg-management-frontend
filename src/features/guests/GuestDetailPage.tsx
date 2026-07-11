import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, ReceiptIndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GuestStatusChip, PaymentStatusChip } from '@/components/StatusChip';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDateOnly, formatMonth, formatTimestamp } from '@/lib/formatDate';
import { computeEffectiveStatus } from '@/lib/effectiveStatus';
import type { PaymentDto } from '@/api/types';
import { usePg } from '@/features/pgs/usePgs';
import { useRooms } from '@/features/rooms/useRooms';
import { usePayments } from '@/features/payments/usePayments';
import { RecordPaymentDialog } from '@/features/payments/RecordPaymentDialog';
import { useGuest } from './useGuests';
import { GuestFormDialog } from './GuestFormDialog';

export function GuestDetailPage() {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const { data: guest, isLoading, isError, refetch } = useGuest(guestId);
  const { data: pg } = usePg(guest?.pgId);
  const { data: rooms } = useRooms(guest?.pgId);
  const { data: payments } = usePayments({ guestId });

  const [editOpen, setEditOpen] = useState(false);
  const [recordTarget, setRecordTarget] = useState<PaymentDto | undefined>();

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !guest) return <ErrorState onRetry={() => refetch()} />;

  const room = rooms?.find((r) => r.id === guest.roomId);
  const sortedPayments = [...(payments ?? [])].sort((a, b) => (a.month < b.month ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/guests')}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All guests
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-primary">{guest.name}</h1>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="PG / Room" value={`${pg?.name ?? '—'} · ${room?.roomNumber ?? '—'}`} />
          <Field label="Phone" value={guest.phone} />
          <Field label="Joining date" value={formatDateOnly(guest.joiningDate)} />
          <Field label="Monthly rent" value={formatCurrency(guest.monthlyRent)} />
          <Field label="Deposit" value={formatCurrency(guest.deposit)} />
          <Field label="Due day" value={String(guest.dueDay)} />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">Status</span>
            <GuestStatusChip status={guest.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <EmptyState
              icon={ReceiptIndianRupee}
              title="No payments yet"
              description="Payments appear here once the guest's first month is billed."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid on</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => {
                  const effective = computeEffectiveStatus(payment, guest.dueDay);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{formatMonth(payment.month)}</TableCell>
                      <TableCell>{formatCurrency(payment.amountDue)}</TableCell>
                      <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                      <TableCell>
                        <PaymentStatusChip status={effective} />
                      </TableCell>
                      <TableCell>
                        {payment.paidOn ? formatTimestamp(payment.paidOn) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRecordTarget(payment)}
                          >
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
        </CardContent>
      </Card>

      <GuestFormDialog open={editOpen} onOpenChange={setEditOpen} guest={guest} />
      <RecordPaymentDialog
        open={!!recordTarget}
        onOpenChange={(open) => !open && setRecordTarget(undefined)}
        payment={recordTarget}
        guestName={guest.name}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
