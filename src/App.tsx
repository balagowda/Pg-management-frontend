import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/auth/AuthProvider';
import { RequireAuth } from '@/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PgListPage } from '@/features/pgs/PgListPage';
import { RoomListPage } from '@/features/rooms/RoomListPage';
import { RoomDetailPage } from '@/features/rooms/RoomDetailPage';
import { GuestListPage } from '@/features/guests/GuestListPage';
import { GuestDetailPage } from '@/features/guests/GuestDetailPage';
import { PaymentListPage } from '@/features/payments/PaymentListPage';
import { DefaultersPage } from '@/features/defaulters/DefaultersPage';
import { SearchPage } from '@/features/search/SearchPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A retry attempt can get stuck in TanStack Query's "paused" fetchStatus
      // if the browser's online/offline detection is unreliable, which leaves
      // list pages rendering nothing (neither loading, error, nor data) since
      // isLoading is false and isError never becomes true. No auto-retry avoids
      // that stuck state; the ErrorState component's manual Retry button
      // covers transient blips instead.
      retry: 0,
      refetchOnWindowFocus: true,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'pgs', element: <PgListPage /> },
          { path: 'pgs/:pgId', element: <RoomListPage /> },
          { path: 'pgs/:pgId/rooms/:roomId', element: <RoomDetailPage /> },
          { path: 'guests', element: <GuestListPage /> },
          { path: 'guests/:guestId', element: <GuestDetailPage /> },
          { path: 'payments', element: <PaymentListPage /> },
          { path: 'defaulters', element: <DefaultersPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
