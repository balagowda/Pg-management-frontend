import { describe, expect, it } from 'vitest';
import {
  formatDateOnly,
  formatMonth,
  resolveDueDate,
  toDateOnlyString,
  toMonthString,
} from './formatDate';

describe('resolveDueDate (dueDay clamping)', () => {
  it('resolves an ordinary dueDay within a 31-day month unchanged', () => {
    const date = resolveDueDate('2026-07', 15);
    expect(date.getDate()).toBe(15);
  });

  it('clamps dueDay 28 into February (28-day month) unchanged', () => {
    const date = resolveDueDate('2026-02', 28);
    expect(date.getMonth()).toBe(1); // February
    expect(date.getDate()).toBe(28);
  });

  it('clamps a dueDay past month-end into a leap-year February without overflowing into March', () => {
    // 2028 is a leap year — February has 29 days.
    const date = resolveDueDate('2028-02', 28);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(28);
  });

  it('never overflows into the next month for a 30-day month', () => {
    const date = resolveDueDate('2026-04', 28);
    expect(date.getMonth()).toBe(3); // April, not May
    expect(date.getDate()).toBe(28);
  });
});

describe('date string formatting round-trips', () => {
  it('formats a yyyy-MM-dd string without time-zone drift', () => {
    expect(formatDateOnly('2026-07-01', 'yyyy-MM-dd')).toBe('2026-07-01');
  });

  it('formats a yyyy-MM month string', () => {
    expect(formatMonth('2026-07', 'yyyy-MM')).toBe('2026-07');
  });

  it('round-trips a Date through toDateOnlyString', () => {
    const date = new Date(2026, 6, 1); // July 1, 2026 (local)
    expect(toDateOnlyString(date)).toBe('2026-07-01');
  });

  it('round-trips a Date through toMonthString', () => {
    const date = new Date(2026, 6, 15);
    expect(toMonthString(date)).toBe('2026-07');
  });
});
