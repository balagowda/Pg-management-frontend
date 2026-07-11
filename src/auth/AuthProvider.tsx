import { type ReactNode } from 'react';
import { useAuthStore } from './useAuthStore';

/**
 * Waits for zustand's localStorage rehydration before rendering routes, so
 * `RequireAuth` never sees a false "logged out" flash on a hard page refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;

  return <>{children}</>;
}
