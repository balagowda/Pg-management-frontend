import { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DoorOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { GradientHeroCard } from '@/components/GradientHeroCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { toErrorMessage } from '@/api/errors';
import type { RoomDto } from '@/api/types';
import { usePg } from '@/features/pgs/usePgs';
import { useGuests } from '@/features/guests/useGuests';
import { useRooms, useDeleteRoom } from './useRooms';
import { RoomFormDialog } from './RoomFormDialog';

type OccupancyFilter = 'ALL' | 'VACANT' | 'FULL';

export function RoomListPage() {
  const { pgId } = useParams<{ pgId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: pg } = usePg(pgId);
  const { data: rooms, isLoading, isError, refetch } = useRooms(pgId);
  const { data: guests } = useGuests(pgId);
  const deleteRoom = useDeleteRoom();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RoomDto | undefined>();

  const query = searchParams.get('q') ?? '';
  const occupancyFilter = (searchParams.get('occupancy') as OccupancyFilter) || 'ALL';
  const sharingFilter = searchParams.get('sharing') ?? '';

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  function occupantsForRoom(roomId: string) {
    return (guests ?? []).filter((g) => g.roomId === roomId && g.status !== 'LEFT');
  }

  const sharingSizes = useMemo(
    () => Array.from(new Set((rooms ?? []).map((r) => r.capacity))).sort((a, b) => a - b),
    [rooms],
  );

  const filteredRooms = useMemo(() => {
    return (rooms ?? []).filter((room) => {
      if (query && !room.roomNumber.toLowerCase().includes(query.toLowerCase())) return false;
      const occupants = occupantsForRoom(room.id).length;
      if (occupancyFilter === 'VACANT' && occupants >= room.capacity) return false;
      if (occupancyFilter === 'FULL' && occupants < room.capacity) return false;
      if (sharingFilter && String(room.capacity) !== sharingFilter) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, guests, query, occupancyFilter, sharingFilter]);

  if (!pgId) return null;

  const totalBeds = (rooms ?? []).reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = (guests ?? []).filter((g) => g.status !== 'LEFT').length;
  const occupancyPercent = totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(room: RoomDto) {
    setEditing(room);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRoom.mutateAsync(deleteTarget.id);
      toast.success('Room deleted');
    } catch (error) {
      toast.error(toErrorMessage(error));
    } finally {
      setDeleteTarget(undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/pgs')} className="mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All PGs
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{pg?.name ?? 'PG'}</h1>
            {pg && (
              <p className="text-sm text-text-secondary">
                {pg.address}, {pg.city}
              </p>
            )}
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add room
          </Button>
        </div>
      </div>

      {!isLoading && !isError && rooms && rooms.length > 0 && (
        <GradientHeroCard>
          <p className="text-sm text-white/80">Occupancy</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{occupancyPercent}%</p>
          <p className="mt-2 text-sm text-white/80">
            Occupied {occupiedBeds} · Vacant {Math.max(totalBeds - occupiedBeds, 0)} · Capacity{' '}
            {totalBeds}
          </p>
        </GradientHeroCard>
      )}

      {!isLoading && !isError && rooms && rooms.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              value={query}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search rooms…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['ALL', 'VACANT', 'FULL'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateParam('occupancy', option)}
                className={cn(
                  'rounded-chip px-3 py-1 text-xs font-medium transition-colors',
                  occupancyFilter === option
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-variant text-text-secondary hover:text-text-primary',
                )}
              >
                {option === 'ALL' ? 'All' : option === 'VACANT' ? 'Vacant' : 'Full'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {sharingSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  updateParam('sharing', sharingFilter === String(size) ? '' : String(size))
                }
                className={cn(
                  'rounded-chip px-3 py-1 text-xs font-medium transition-colors',
                  sharingFilter === String(size)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-surface-variant text-text-secondary hover:text-text-primary',
                )}
              >
                {size}'s
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && rooms && rooms.length === 0 && (
        <EmptyState
          icon={DoorOpen}
          title="No rooms yet"
          description="Add a room before you can move in guests."
          actionLabel="Add room"
          onAction={openCreate}
        />
      )}

      {!isLoading && !isError && rooms && rooms.length > 0 && filteredRooms.length === 0 && (
        <EmptyState
          icon={Search}
          title="No rooms match your filters"
          description="Try clearing the search or filters."
        />
      )}

      {!isLoading && !isError && filteredRooms.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room) => {
              const occupants = occupantsForRoom(room.id);
              const full = occupants.length >= room.capacity;
              return (
                <TableRow
                  key={room.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/pgs/${pgId}/rooms/${room.id}`)}
                >
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={full ? 'neutral' : 'success'}>
                      {occupants.length}/{room.capacity} {full ? 'full' : 'vacant'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(room);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(room);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} pgId={pgId} room={editing} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title={`Delete room ${deleteTarget?.roomNumber}?`}
        description="This also deletes its guests and payment history. This cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
