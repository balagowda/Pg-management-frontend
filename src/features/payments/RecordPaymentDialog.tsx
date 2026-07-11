import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatCurrency';
import { normalizeNote } from '@/lib/normalizeNote';
import { toErrorMessage } from '@/api/errors';
import type { PaymentDto } from '@/api/types';
import { useUpdatePayment } from './usePayments';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentDto;
  guestName?: string;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  payment,
  guestName,
}: RecordPaymentDialogProps) {
  const updatePayment = useUpdatePayment();
  const [increment, setIncrement] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!payment) return null;

  const remaining = payment.amountDue - payment.amountPaid;
  const incrementValue = Number(increment) || 0;
  const projectedTotal = payment.amountPaid + incrementValue;

  function closeAndReset(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setIncrement('');
      setNote('');
    }
  }

  async function onSubmit() {
    if (!payment || incrementValue <= 0) return;
    setSubmitting(true);
    try {
      // Payments accumulate server-side: send currentAmountPaid + increment,
      // never the increment alone — a PUT with amountPaid: 4000 against a row
      // that already has 2000 results in 6000, not an overwrite.
      await updatePayment.mutateAsync({
        ...payment,
        amountPaid: payment.amountPaid + incrementValue,
        note: normalizeNote(note),
      });
      toast.success('Payment recorded');
      closeAndReset(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment{guestName ? ` — ${guestName}` : ''}</DialogTitle>
          <DialogDescription>
            {payment.month} · Due {formatCurrency(payment.amountDue)} · Paid so far{' '}
            {formatCurrency(payment.amountPaid)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-increment">Amount being paid now</Label>
            <Input
              id="payment-increment"
              type="number"
              min={1}
              step={1}
              placeholder={`Remaining: ${formatCurrency(Math.max(remaining, 0))}`}
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-text-tertiary">
              This is added to what's already paid — not a replacement total.
              {incrementValue > 0 && ` New total paid: ${formatCurrency(projectedTotal)}.`}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-note">Note (optional)</Label>
            <Input
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Leave blank to keep the existing note"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => closeAndReset(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={submitting || incrementValue <= 0}>
            {submitting ? 'Recording…' : 'Record payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
