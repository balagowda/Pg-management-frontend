import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GuestStatusChip } from '@/components/StatusChip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/formatCurrency';
import { toErrorMessage } from '@/api/errors';
import type { GuestDto } from '@/api/types';
import { usePgs } from '@/features/pgs/usePgs';
import { useRooms } from '@/features/rooms/useRooms';
import { useGuests, useDeleteGuest } from './useGuests';
import { GuestFormDialog } from './GuestFormDialog';

export function GuestListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pgId = searchParams.get('pgId') ?? '';
  const query = searchParams.get('q') ?? '';

  const { data: pgs } = usePgs();
  const { data: rooms } = useRooms();
  const { data: guests, isLoading, isError, refetch } = useGuests(pgId || undefined);
  const deleteGuest = useDeleteGuest();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GuestDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<GuestDto | undefined>();

  function roomLabel(roomId: string) {
    return rooms?.find((r) => r.id === roomId)?.roomNumber ?? '—';
  }

  function pgLabel(id: string) {
    return pgs?.find((p) => p.id === id)?.name ?? '—';
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  const filteredGuests = useMemo(() => {
    if (!query.trim()) return guests ?? [];
    const q = query.trim().toLowerCase();
    return (guests ?? []).filter(
      (guest) =>
        guest.name.toLowerCase().includes(q) ||
        guest.phone.toLowerCase().includes(q) ||
        roomLabel(guest.roomId).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, rooms, query]);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(guest: GuestDto) {
    setEditing(guest);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGuest.mutateAsync(deleteTarget.id);
      toast.success('Guest removed');
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleteTarget(undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text-primary">Guests</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={query}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search name, phone, room…"
              className="pl-9"
            />
          </div>
          <Select value={pgId || 'all'} onValueChange={(value) => updateParam('pgId', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All PGs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PGs</SelectItem>
              {(pgs ?? []).map((pg) => (
                <SelectItem key={pg.id} value={pg.id}>
                  {pg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add guest
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && guests && guests.length === 0 && (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Add a guest to start tracking rent for a room."
          actionLabel="Add guest"
          onAction={openCreate}
        />
      )}

      {!isLoading && !isError && guests && guests.length > 0 && filteredGuests.length === 0 && (
        <EmptyState
          icon={Search}
          title="No guests match your search"
          description="Try a different name, phone, or room number."
        />
      )}

      {!isLoading && !isError && filteredGuests.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>PG / Room</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Monthly rent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <Link
                    to={`/guests/${guest.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {guest.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {pgLabel(guest.pgId)} · {roomLabel(guest.roomId)}
                </TableCell>
                <TableCell>{guest.phone}</TableCell>
                <TableCell>{formatCurrency(guest.monthlyRent)}</TableCell>
                <TableCell>
                  <GuestStatusChip status={guest.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(guest)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    onClick={() => setDeleteTarget(guest)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <GuestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        guest={editing}
        defaultPgId={pgId || undefined}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title={`Remove ${deleteTarget?.name}?`}
        description="This also deletes their payment history. This cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
