import { AlertTriangle, Bed, Building2, DoorOpen, RefreshCw, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { KpiCard } from '@/components/KpiCard';
import { GradientHeroCard } from '@/components/GradientHeroCard';
import { formatCurrency } from '@/lib/formatCurrency';
import { useDashboard } from './useDashboard';
import { Sparkline } from './Sparkline';
import { UpcomingDues } from './UpcomingDues';
import { ActivityFeed } from './ActivityFeed';

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      </div>

      <GradientHeroCard>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-white/80">Revenue this month</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {formatCurrency(data.revenueThisMonth)}
            </p>
            <div className="mt-2 flex items-center gap-3 text-sm text-white/80">
              <span>Today's collection: {formatCurrency(data.todaysCollection)}</span>
              {data.trendPercent != null && (
                <span className="font-medium text-white">
                  {data.trendPercent >= 0 ? '+' : ''}
                  {data.trendPercent.toFixed(1)}% vs last month
                </span>
              )}
            </div>
          </div>
          <div className="w-full sm:w-56">
            <Sparkline data={data.sparkline} />
          </div>
        </div>
      </GradientHeroCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Total PGs"
          value={String(data.totalPgs)}
          subtitle={`${data.totalRooms} rooms`}
        />
        <KpiCard
          icon={Bed}
          label="Occupancy"
          value={`${data.occupancyPercent.toFixed(0)}%`}
          subtitle={`${data.occupiedBeds}/${data.totalBeds} beds occupied`}
        />
        <KpiCard
          icon={Wallet}
          label="Pending amount"
          value={formatCurrency(data.pendingAmount)}
          subtitle={`${data.defaulterCount} defaulters`}
        />
        <KpiCard
          icon={DoorOpen}
          label="Vacant beds"
          value={String(data.vacantBeds)}
          subtitle={`${data.roomsWithVacancy} rooms with vacancy`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Guests needing reminder"
          value={String(data.guestsNeedingReminder)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Due tomorrow"
          value={String(data.paymentsDueTomorrow)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingDues dues={data.upcomingDues} />
        <ActivityFeed activity={data.recentActivity} />
      </div>
    </div>
  );
}
