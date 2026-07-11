import { describe, expect, it } from 'vitest';
import { roomSchema } from './schemas';

describe('roomSchema capacity (positive integer, >= 1)', () => {
  it('accepts capacity 1 (lower bound)', () => {
    expect(roomSchema.safeParse({ roomNumber: '101', capacity: 1 }).success).toBe(true);
  });

  it('rejects capacity 0', () => {
    expect(roomSchema.safeParse({ roomNumber: '101', capacity: 0 }).success).toBe(false);
  });

  it('rejects a negative capacity', () => {
    expect(roomSchema.safeParse({ roomNumber: '101', capacity: -2 }).success).toBe(false);
  });

  it('rejects a non-integer capacity', () => {
    expect(roomSchema.safeParse({ roomNumber: '101', capacity: 2.5 }).success).toBe(false);
  });

  it('coerces a numeric string from a form input', () => {
    const result = roomSchema.safeParse({ roomNumber: '101', capacity: '4' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.capacity).toBe(4);
  });

  it('rejects an empty room number', () => {
    expect(roomSchema.safeParse({ roomNumber: '', capacity: 2 }).success).toBe(false);
  });
});
