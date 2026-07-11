import { resolveDueDate } from './formatDate';
import type { PaymentDto } from '@/api/types';

export type EffectiveStatus = PaymentDto['status'] | 'OVERDUE_DISPLAY';

/**
 * Client-side *display-only* guess at whether a payment is overdue, since the
 * server only promotes PENDING/PARTIAL rows to OVERDUE via a nightly job and
 * `GET /payments` can lag reality by up to a day. Never write this back into
 * the query cache in place of `status` — it's a UI label only, and a refetch
 * is always the source of truth.
 */
export function computeEffectiveStatus(
  payment: Pick<PaymentDto, 'amountPaid' | 'amountDue' | 'month' | 'status'>,
  dueDay: number,
): EffectiveStatus {
  if (payment.amountPaid >= payment.amountDue) return 'PAID';

  const dueDate = resolveDueDate(payment.month, dueDay);
  const isPastDue = Date.now() > dueDate.getTime();

  if (isPastDue && payment.status !== 'OVERDUE') return 'OVERDUE_DISPLAY';
  if (payment.status === 'OVERDUE') return 'OVERDUE';
  return payment.amountPaid > 0 ? 'PARTIAL' : 'PENDING';
}
