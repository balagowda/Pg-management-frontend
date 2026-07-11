import { formatCurrency } from './formatCurrency';

/** Ported verbatim from the Android app's IntentUtils.kt + strings.xml. */
export function waLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function reminderMessage(
  guestName: string,
  outstanding: number,
  monthLabel: string,
): string {
  return `Hi ${guestName}, a gentle reminder that your rent of ${formatCurrency(outstanding)} for ${monthLabel} is due. Please pay at the earliest. Thank you!`;
}

export function receiptMessage(
  guestName: string,
  amountPaid: number,
  monthLabel: string,
  pgName: string,
): string {
  return `Hi ${guestName}, we have received your payment of ${formatCurrency(amountPaid)} towards rent for ${monthLabel} at ${pgName}. Thank you! — PG Manager`;
}

export function telLink(phone: string): string {
  return `tel:${phone}`;
}
