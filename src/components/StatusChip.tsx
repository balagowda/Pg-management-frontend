import { Badge } from '@/components/ui/badge';
import type { GuestStatus, PaymentStatus } from '@/api/types';
import type { EffectiveStatus } from '@/lib/effectiveStatus';
import {
  guestStatusLabel,
  guestStatusVariant,
  paymentStatusLabel,
  paymentStatusVariant,
} from '@/design/statusChip';

export function PaymentStatusChip({ status }: { status: PaymentStatus | EffectiveStatus }) {
  return <Badge variant={paymentStatusVariant(status)}>{paymentStatusLabel(status)}</Badge>;
}

export function GuestStatusChip({ status }: { status: GuestStatus }) {
  return <Badge variant={guestStatusVariant(status)}>{guestStatusLabel(status)}</Badge>;
}
