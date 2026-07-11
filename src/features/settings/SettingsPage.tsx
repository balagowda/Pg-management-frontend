import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/auth/useAuthStore';
import { logout as logoutRequest } from '@/api/endpoints/auth';

export function SettingsPage() {
  const owner = useAuthStore((s) => s.owner);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
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
    </div>
  );
}
