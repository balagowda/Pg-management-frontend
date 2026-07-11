/**
 * The backend keeps a payment's existing note when a PUT sends null/blank —
 * it never wipes a prior note on partial update. Mirror that on the client:
 * whitespace-only input normalizes to null ("no new note"), never `""`.
 */
export function normalizeNote(input: string): string | null {
  const trimmed = input.trim();
  return trimmed ? trimmed : null;
}
