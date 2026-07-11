import { isAxiosError } from 'axios';
import type { ProblemDetail } from './types';

export function toProblemDetail(error: unknown): ProblemDetail | null {
  if (isAxiosError<ProblemDetail>(error) && error.response?.data?.status) {
    return error.response.data;
  }
  return null;
}

/** Human-readable fallback message for toasts when a request fails. */
export function toErrorMessage(error: unknown): string {
  const problem = toProblemDetail(error);
  if (problem) {
    if (problem.status === 500) return 'Something went wrong. Please try again.';
    return problem.detail || problem.title || 'Something went wrong.';
  }
  if (isAxiosError(error) && !error.response) return 'Network error — check your connection.';
  return 'Something went wrong. Please try again.';
}
