import { describe, expect, it } from 'vitest';
import { guestStatusVariant, paymentStatusVariant } from './statusChip';

describe('paymentStatusVariant', () => {
  it.each([
    ['PAID', 'success'],
    ['PENDING', 'info'],
    ['PARTIAL', 'warning'],
    ['OVERDUE', 'error'],
    ['OVERDUE_DISPLAY', 'error'],
  ] as const)('maps %s to the %s chip color', (status, expected) => {
    expect(paymentStatusVariant(status)).toBe(expected);
  });
});

describe('guestStatusVariant', () => {
  it.each([
    ['ACTIVE', 'success'],
    ['NOTICE', 'warning'],
    ['LEFT', 'neutral'],
  ] as const)('maps %s to the %s chip color', (status, expected) => {
    expect(guestStatusVariant(status)).toBe(expected);
  });
});
