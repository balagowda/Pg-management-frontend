import { useNavigate } from 'react-router-dom';
import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/auth/useAuthStore';
import { logout as logoutRequest } from '@/api/endpoints/auth';
import { useThemeStore, type ThemeMode } from '@/design/useTheme';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { mode: 'SYSTEM', label: 'System', icon: Monitor },
  { mode: 'LIGHT', label: 'Light', icon: Sun },
  { mode: 'DARK', label: 'Dark', icon: Moon },
];

export function SettingsPage() {
  const owner = useAuthStore((s) => s.owner);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // best-effort — clear the local session regardless
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-primary">Settings</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-text-tertiary">Name</p>
            <p className="text-sm font-medium text-text-primary">{owner?.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Email</p>
            <p className="text-sm font-medium text-text-primary">{owner?.email}</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="mt-2 w-fit">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-flex items-center gap-1 rounded-field bg-surface-variant p-1">
            {THEME_OPTIONS.map(({ mode: optionMode, label, icon: Icon }) => (
              <button
                key={optionMode}
                type="button"
                onClick={() => setMode(optionMode)}
                className={cn(
                  'flex items-center gap-1.5 rounded-button px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === optionMode
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
