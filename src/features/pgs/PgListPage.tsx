import { useState } from 'react';
import { Building2, Home, Plus, ReceiptIndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { GradientHeroCard } from '@/components/GradientHeroCard';
import { KpiCard } from '@/components/KpiCard';
import { formatCurrency } from '@/lib/formatCurrency';
import { toErrorMessage } from '@/api/errors';
import type { PgDto } from '@/api/types';
import { useRooms } from '@/features/rooms/useRooms';
import { useGuests } from '@/features/guests/useGuests';
import { useDashboard } from '@/features/dashboard/useDashboard';
import { usePgs, useDeletePg } from './usePgs';
import { PgCard } from './PgCard';
import { PgFormDialog } from './PgFormDialog';

export function PgListPage() {
  const { data: pgs, isLoading, isError, refetch } = usePgs();
  const { data: rooms } = useRooms();
  const { data: guests } = useGuests();
  const { data: dashboard } = useDashboard();
  const deletePg = useDeletePg();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PgDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<PgDto | undefined>();

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(pg: PgDto) {
    setEditing(pg);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deletePg.mutateAsync(deleteTarget.id);
      toast.success('PG deleted');
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleteTarget(undefined);
    }
  }

  const totalBeds = (rooms ?? []).reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = (guests ?? []).filter((g) => g.status !== 'LEFT').length;
  const occupancyPercent = totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);
  const vacantBeds = Math.max(totalBeds - occupiedBeds, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">PGs</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add PG
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && pgs && pgs.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No PGs yet"
          description="Add your first property to start managing rooms and guests."
          actionLabel="Add PG"
          onAction={openCreate}
        />
      )}

      {!isLoading && !isError && pgs && pgs.length > 0 && (
        <>
          <GradientHeroCard>
            <p className="text-sm text-white/80">Overall Occupancy</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{occupancyPercent}%</p>
            <p className="mt-2 text-sm text-white/80">
              Occupied {occupiedBeds} · Vacant {vacantBeds} · Capacity {totalBeds}
            </p>
          </GradientHeroCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              icon={ReceiptIndianRupee}
              label="Revenue this month"
              value={dashboard ? formatCurrency(dashboard.revenueThisMonth) : '—'}
            />
            <KpiCard icon={Building2} label="Total PGs" value={String(pgs.length)} />
            <KpiCard icon={Home} label="Total Rooms" value={String((rooms ?? []).length)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pgs.map((pg) => {
              const pgRooms = (rooms ?? []).filter((r) => r.pgId === pg.id);
              const pgTotal = pgRooms.reduce((sum, r) => sum + r.capacity, 0);
              const pgOccupied = (guests ?? []).filter(
                (g) => g.pgId === pg.id && g.status !== 'LEFT',
              ).length;
              return (
                <PgCard
                  key={pg.id}
                  pg={pg}
                  occupancy={{ occupied: pgOccupied, total: pgTotal }}
                  onEdit={() => openEdit(pg)}
                  onDelete={() => setDeleteTarget(pg)}
                />
              );
            })}
          </div>
        </>
      )}

      <PgFormDialog open={formOpen} onOpenChange={setFormOpen} pg={editing} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title={`Delete ${deleteTarget?.name}?`}
        description="This also deletes all of its rooms, guests, and payment history. This cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
