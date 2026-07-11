import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('uses Indian digit grouping, not Western grouping', () => {
    expect(formatCurrency(100000)).toBe('₹1,00,000');
  });

  it('formats small amounts without unnecessary grouping', () => {
    expect(formatCurrency(500)).toBe('₹500');
  });

  it('drops fraction digits', () => {
    expect(formatCurrency(9999.6)).toBe('₹10,000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });
});
