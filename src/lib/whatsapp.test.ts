import { describe, expect, it } from 'vitest';
import { reminderMessage, waLink } from './whatsapp';

describe('waLink', () => {
  it('prefixes a bare 10-digit Indian number with the 91 country code', () => {
    expect(waLink('9876543210', 'hi')).toBe('https://wa.me/919876543210?text=hi');
  });

  it('leaves a number that already has a country code unchanged', () => {
    expect(waLink('919876543210', 'hi')).toBe('https://wa.me/919876543210?text=hi');
  });

  it('strips non-digit formatting characters before checking length', () => {
    expect(waLink('+91 98765-43210', 'hi')).toBe('https://wa.me/919876543210?text=hi');
  });

  it('URL-encodes the message', () => {
    expect(waLink('9876543210', 'a & b')).toContain(encodeURIComponent('a & b'));
  });
});

describe('reminderMessage', () => {
  it('includes the guest name, formatted amount, and month', () => {
    const message = reminderMessage('Asha', 10000, 'July 2026');
    expect(message).toContain('Asha');
    expect(message).toContain('₹10,000');
    expect(message).toContain('July 2026');
  });
});
