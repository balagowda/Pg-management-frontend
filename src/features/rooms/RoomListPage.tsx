import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DoorOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { toErrorMessage } from '@/api/errors';
import type { RoomDto } from '@/api/types';
import { usePg } from '@/features/pgs/usePgs';
import { useGuests } from '@/features/guests/useGuests';
import { useRooms, useDeleteRoom } from './useRooms';
import { RoomFormDialog } from './RoomFormDialog';

export function RoomListPage() {
  const { pgId } = useParams<{ pgId: string }>();
  const navigate = useNavigate();
  const { data: pg } = usePg(pgId);
  const { data: rooms, isLoading, isError, refetch } = useRooms(pgId);
  const { data: guests } = useGuests(pgId);
  const deleteRoom = useDeleteRoom();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RoomDto | undefined>();

  if (!pgId) return null;

  function occupantsForRoom(roomId: string) {
    return (guests ?? []).filter((g) => g.roomId === roomId && g.status !== 'LEFT');
  }

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

      {!isLoading && !isError && rooms && rooms.length > 0 && (
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
            {rooms.map((room) => {
              const occupants = occupantsForRoom(room.id);
              const full = occupants.length >= room.capacity;
              return (
                <TableRow key={room.id}>
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
                      onClick={() => openEdit(room)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error"
                      onClick={() => setDeleteTarget(room)}
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
