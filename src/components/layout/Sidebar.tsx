import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  LayoutDashboard,
  ReceiptIndianRupee,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pgs', label: 'PGs', icon: Building2 },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/payments', label: 'Payments', icon: ReceiptIndianRupee },
  { to: '/defaulters', label: 'Defaulters', icon: AlertTriangle },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-divider bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-field bg-primary-container">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-text-primary">PG Manager</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-container text-primary'
                  : 'text-text-secondary hover:bg-surface-variant hover:text-text-primary',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-container text-primary'
                : 'text-text-secondary hover:bg-surface-variant hover:text-text-primary',
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
