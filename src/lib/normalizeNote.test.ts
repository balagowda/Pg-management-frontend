import { describe, expect, it } from 'vitest';
import { normalizeNote } from './normalizeNote';

describe('normalizeNote', () => {
  it('trims surrounding whitespace from a real note', () => {
    expect(normalizeNote('  paid in cash  ')).toBe('paid in cash');
  });

  it('normalizes an empty string to null', () => {
    expect(normalizeNote('')).toBeNull();
  });

  it('normalizes a whitespace-only string to null', () => {
    expect(normalizeNote('   ')).toBeNull();
  });
});
