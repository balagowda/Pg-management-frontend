import { format, parseISO, isValid, getDaysInMonth, parse as parseDateFns } from 'date-fns';

/** Parses a `yyyy-MM-dd` date-only string (guest.joiningDate) without time-zone drift. */
export function parseDateOnly(value: string): Date {
  return parseDateFns(value, 'yyyy-MM-dd', new Date());
}

/** Parses a `yyyy-MM` month string (payment.month). */
export function parseMonth(value: string): Date {
  return parseDateFns(value, 'yyyy-MM', new Date());
}

export function formatDateOnly(value: string, pattern = 'dd MMM yyyy'): string {
  const date = parseDateOnly(value);
  return isValid(date) ? format(date, pattern) : value;
}

export function formatMonth(value: string, pattern = 'MMMM yyyy'): string {
  const date = parseMonth(value);
  return isValid(date) ? format(date, pattern) : value;
}

/** Formats an epoch-millis timestamp (paidOn, recentActivity, JWT expiresIn). */
export function formatTimestamp(millis: number, pattern = 'dd MMM yyyy, h:mm a'): string {
  return format(new Date(millis), pattern);
}

export function formatRelativeShort(millis: number): string {
  const diffMs = Date.now() - millis;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

/**
 * Clamps a guest's dueDay (1..28) into a real calendar date for a given
 * `yyyy-MM` month — a dueDay near month-end must never overflow into the
 * next month (e.g. dueDay 30 in February must resolve to the 28th, not
 * March 2nd).
 */
export function resolveDueDate(month: string, dueDay: number): Date {
  const monthStart = parseMonth(month);
  const daysInMonth = getDaysInMonth(monthStart);
  const clampedDay = Math.min(dueDay, daysInMonth);
  const date = new Date(monthStart);
  date.setDate(clampedDay);
  return date;
}

export function toDateOnlyString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toMonthString(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function currentMonthString(): string {
  return toMonthString(new Date());
}

/** Re-exported for callers that already have an ISO datetime string. */
export function formatIso(value: string, pattern = 'dd MMM yyyy'): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, pattern) : value;
}
