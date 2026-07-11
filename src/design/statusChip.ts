import type { BadgeProps } from '@/components/ui/badge';
import type { GuestStatus, PaymentStatus } from '@/api/types';
import type { EffectiveStatus } from '@/lib/effectiveStatus';

type ChipVariant = NonNullable<BadgeProps['variant']>;

// Centralized status -> chip color mapping, mirroring the Android app's
// ChipStatus mapping exactly. Never pick a chip color ad hoc at a call site.
const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, ChipVariant> = {
  PAID: 'success',
  PENDING: 'info',
  PARTIAL: 'warning',
  OVERDUE: 'error',
};

const GUEST_STATUS_VARIANT: Record<GuestStatus, ChipVariant> = {
  ACTIVE: 'success',
  NOTICE: 'warning',
  LEFT: 'neutral',
};

export function paymentStatusVariant(status: PaymentStatus | EffectiveStatus): ChipVariant {
  if (status === 'OVERDUE_DISPLAY') return 'error';
  return PAYMENT_STATUS_VARIANT[status];
}

export function guestStatusVariant(status: GuestStatus): ChipVariant {
  return GUEST_STATUS_VARIANT[status];
}

export function paymentStatusLabel(status: PaymentStatus | EffectiveStatus): string {
  if (status === 'OVERDUE_DISPLAY') return 'Overdue';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function guestStatusLabel(status: GuestStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
