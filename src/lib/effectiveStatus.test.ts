import { describe, expect, it, vi, afterEach } from 'vitest';
import { computeEffectiveStatus } from './effectiveStatus';

describe('computeEffectiveStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is PAID once amountPaid >= amountDue, regardless of due date', () => {
    const status = computeEffectiveStatus(
      { amountPaid: 10000, amountDue: 10000, month: '2026-01', status: 'PAID' },
      5,
    );
    expect(status).toBe('PAID');
  });

  it('is PENDING before the due date with nothing paid', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 1)); // July 1, dueDay 5 not yet reached
    const status = computeEffectiveStatus(
      { amountPaid: 0, amountDue: 10000, month: '2026-07', status: 'PENDING' },
      5,
    );
    expect(status).toBe('PENDING');
  });

  it('is PARTIAL before the due date with a partial payment', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 1));
    const status = computeEffectiveStatus(
      { amountPaid: 4000, amountDue: 10000, month: '2026-07', status: 'PARTIAL' },
      5,
    );
    expect(status).toBe('PARTIAL');
  });

  it('surfaces OVERDUE_DISPLAY once past the due date if the server has not promoted it yet', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10)); // past dueDay 5, server status still PENDING
    const status = computeEffectiveStatus(
      { amountPaid: 0, amountDue: 10000, month: '2026-07', status: 'PENDING' },
      5,
    );
    expect(status).toBe('OVERDUE_DISPLAY');
  });

  it('reflects a server-confirmed OVERDUE status as-is, not the display guess', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10));
    const status = computeEffectiveStatus(
      { amountPaid: 0, amountDue: 10000, month: '2026-07', status: 'OVERDUE' },
      5,
    );
    expect(status).toBe('OVERDUE');
  });
});
