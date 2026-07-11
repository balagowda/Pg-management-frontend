import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './useTheme';

describe('useThemeStore', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('light', 'dark');
    localStorage.clear();
  });

  it('SYSTEM mode removes both light and dark classes', () => {
    document.documentElement.classList.add('dark');
    useThemeStore.getState().setMode('SYSTEM');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('DARK mode adds .dark and removes .light', () => {
    document.documentElement.classList.add('light');
    useThemeStore.getState().setMode('DARK');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('LIGHT mode adds .light and removes .dark', () => {
    document.documentElement.classList.add('dark');
    useThemeStore.getState().setMode('LIGHT');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists the chosen mode to localStorage', () => {
    useThemeStore.getState().setMode('DARK');
    expect(localStorage.getItem('theme-mode')).toBe('DARK');
  });
});
