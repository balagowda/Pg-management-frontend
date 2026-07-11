import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Owner } from '@/api/types';

interface Session {
  token: string;
  refreshToken: string;
  owner: Owner;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  owner: Owner | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      owner: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ token, refreshToken, owner }) =>
        set({ token, refreshToken, owner, isAuthenticated: true }),
      clearSession: () =>
        set({ token: null, refreshToken: null, owner: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'pg-manager-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        owner: state.owner,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
