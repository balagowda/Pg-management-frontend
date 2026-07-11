import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toErrorMessage } from '@/api/errors';
import type { RoomDto } from '@/api/types';
import { roomSchema, type RoomFormInput, type RoomFormValues } from './schemas';
import { useCreateRoom, useUpdateRoom } from './useRooms';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pgId: string;
  room?: RoomDto;
}

export function RoomFormDialog({ open, onOpenChange, pgId, room }: RoomFormDialogProps) {
  const isEdit = !!room;
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { roomNumber: '', capacity: 1 },
  });

  useEffect(() => {
    if (open) {
      reset(
        room
          ? { roomNumber: room.roomNumber, capacity: room.capacity }
          : { roomNumber: '', capacity: 1 },
      );
    }
  }, [open, room, reset]);

  async function onSubmit(values: RoomFormValues) {
    try {
      if (isEdit) {
        await updateRoom.mutateAsync({ ...room, ...values });
        toast.success('Room updated');
      } else {
        await createRoom.mutateAsync({ id: crypto.randomUUID(), pgId, ...values });
        toast.success('Room created');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit room' : 'Add room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-number">Room number</Label>
            <Input id="room-number" {...register('roomNumber')} />
            {errors.roomNumber && <p className="text-xs text-error">{errors.roomNumber.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-capacity">Capacity</Label>
            <Input id="room-capacity" type="number" min={1} step={1} {...register('capacity')} />
            {errors.capacity && <p className="text-xs text-error">{errors.capacity.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Save changes' : 'Add room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
