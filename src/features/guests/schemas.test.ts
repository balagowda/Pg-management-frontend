import { describe, expect, it } from 'vitest';
import { guestSchema } from './schemas';

const BASE = {
  pgId: 'pg-1',
  roomId: 'room-1',
  name: 'Asha',
  phone: '9999999999',
  joiningDate: '2026-07-01',
  monthlyRent: 10000,
  deposit: 20000,
  status: 'ACTIVE' as const,
};

describe('guestSchema dueDay boundary (1..28 inclusive)', () => {
  it('accepts dueDay 1 (lower bound)', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 1 }).success).toBe(true);
  });

  it('accepts dueDay 28 (upper bound)', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 28 }).success).toBe(true);
  });

  it('rejects dueDay 0', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 0 }).success).toBe(false);
  });

  it('rejects dueDay 29', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 29 }).success).toBe(false);
  });

  it('rejects a non-integer dueDay', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5.5 }).success).toBe(false);
  });
});

describe('guestSchema status enum', () => {
  it.each(['ACTIVE', 'NOTICE', 'LEFT'])('accepts %s', (status) => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5, status }).success).toBe(true);
  });

  it('rejects a status outside the three literals', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5, status: 'INACTIVE' }).success).toBe(false);
  });
});

describe('guestSchema monthlyRent/deposit', () => {
  it('rejects zero or negative monthlyRent', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5, monthlyRent: 0 }).success).toBe(false);
  });

  it('accepts a zero deposit', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5, deposit: 0 }).success).toBe(true);
  });

  it('rejects a negative deposit', () => {
    expect(guestSchema.safeParse({ ...BASE, dueDay: 5, deposit: -1 }).success).toBe(false);
  });
});
