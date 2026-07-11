import { create } from 'zustand';

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

const STORAGE_KEY = 'theme-mode';

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  // SYSTEM removes both classes and lets the prefers-color-scheme block in
  // tokens.css win — LIGHT/DARK force an explicit override.
  if (mode === 'LIGHT') root.classList.add('light');
  if (mode === 'DARK') root.classList.add('dark');
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'LIGHT' || stored === 'DARK' || stored === 'SYSTEM' ? stored : 'SYSTEM';
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Applied at module load (imported eagerly from main.tsx) so the correct
// class is on <html> before first paint — no flash of the wrong theme.
const initialMode = readStoredMode();
applyMode(initialMode);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    applyMode(mode);
    set({ mode });
  },
}));
