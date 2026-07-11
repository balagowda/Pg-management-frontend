import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { RoomStatTiles } from '@/components/RoomStatTiles';
import { formatCurrency } from '@/lib/formatCurrency';
import { toErrorMessage } from '@/api/errors';
import { useGuests } from '@/features/guests/useGuests';
import { GuestFormDialog } from '@/features/guests/GuestFormDialog';
import { usePg } from '@/features/pgs/usePgs';
import { useRooms, useDeleteRoom } from './useRooms';
import { RoomFormDialog } from './RoomFormDialog';

export function RoomDetailPage() {
  const { pgId, roomId } = useParams<{ pgId: string; roomId: string }>();
  const navigate = useNavigate();
  const { data: pg } = usePg(pgId);
  const { data: rooms, isLoading, isError, refetch } = useRooms(pgId);
  const { data: guests } = useGuests(pgId);
  const deleteRoom = useDeleteRoom();

  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!pgId || !roomId) return null;

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const foundRoom = rooms?.find((r) => r.id === roomId);
  if (isError || !foundRoom) return <ErrorState onRetry={() => refetch()} />;
  const room = foundRoom;

  const occupants = (guests ?? []).filter((g) => g.roomId === roomId && g.status !== 'LEFT');

  async function confirmDelete() {
    try {
      await deleteRoom.mutateAsync(room.id);
      toast.success('Room deleted');
      navigate(`/pgs/${pgId}`);
    } catch (error) {
      toast.error(toErrorMessage(error));
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/pgs/${pgId}`)}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {pg?.name ?? 'PG'}
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-primary">Room {room.roomNumber}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditRoomOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <RoomStatTiles capacity={room.capacity} occupied={occupants.length} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Guests in this room</CardTitle>
          <Button size="sm" onClick={() => setAddGuestOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
        </CardHeader>
        <CardContent>
          {occupants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No guests in this room yet"
              description="Add a guest to move them into this room."
              actionLabel="Add Guest"
              onAction={() => setAddGuestOpen(true)}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-divider">
              {occupants.map((guest) => (
                <li key={guest.id} className="flex items-center justify-between py-3">
                  <Link to={`/guests/${guest.id}`} className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary hover:underline">
                      {guest.name}
                    </p>
                    <p className="text-xs text-text-secondary">{guest.phone}</p>
                  </Link>
                  <span className="text-sm font-medium text-text-primary">
                    {formatCurrency(guest.monthlyRent)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <RoomFormDialog open={editRoomOpen} onOpenChange={setEditRoomOpen} pgId={pgId} room={room} />
      <GuestFormDialog
        open={addGuestOpen}
        onOpenChange={setAddGuestOpen}
        defaultPgId={pgId}
        defaultRoomId={roomId}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete room ${room.roomNumber}?`}
        description="This also deletes its guests and payment history. This cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
