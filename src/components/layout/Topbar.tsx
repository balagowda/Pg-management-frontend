import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { useAuthStore } from '@/auth/useAuthStore';
import { logout as logoutRequest } from '@/api/endpoints/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
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
    <header className="flex h-16 items-center justify-between gap-4 border-b border-divider bg-surface px-6">
      <GlobalSearch />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-field px-2 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-variant">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-primary">
            <UserIcon className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{owner?.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{owner?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-error">
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
