import { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { toErrorMessage } from '@/api/errors';
import type { PgDto } from '@/api/types';
import { usePgs, useDeletePg } from './usePgs';
import { PgCard } from './PgCard';
import { PgFormDialog } from './PgFormDialog';

export function PgListPage() {
  const { data: pgs, isLoading, isError, refetch } = usePgs();
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pgs.map((pg) => (
            <PgCard
              key={pg.id}
              pg={pg}
              onEdit={() => openEdit(pg)}
              onDelete={() => setDeleteTarget(pg)}
            />
          ))}
        </div>
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
