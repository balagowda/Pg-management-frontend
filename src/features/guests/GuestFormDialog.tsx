import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toErrorMessage } from '@/api/errors';
import type { GuestDto } from '@/api/types';
import { usePgs } from '@/features/pgs/usePgs';
import { useRooms } from '@/features/rooms/useRooms';
import { guestSchema, type GuestFormInput, type GuestFormValues } from './schemas';
import { useCreateGuest, useUpdateGuest } from './useGuests';

interface GuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: GuestDto;
  defaultPgId?: string;
  defaultRoomId?: string;
}

const EMPTY_VALUES: GuestFormInput = {
  pgId: '',
  roomId: '',
  name: '',
  phone: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  monthlyRent: 0,
  deposit: 0,
  dueDay: 5,
  status: 'ACTIVE',
};

export function GuestFormDialog({
  open,
  onOpenChange,
  guest,
  defaultPgId,
  defaultRoomId,
}: GuestFormDialogProps) {
  const isEdit = !!guest;
  const { data: pgs } = usePgs();
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormInput, unknown, GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedPgId = watch('pgId');
  const { data: rooms } = useRooms(selectedPgId || undefined);

  useEffect(() => {
    if (open) {
      reset(
        guest
          ? {
              pgId: guest.pgId,
              roomId: guest.roomId,
              name: guest.name,
              phone: guest.phone,
              joiningDate: guest.joiningDate,
              monthlyRent: guest.monthlyRent,
              deposit: guest.deposit,
              dueDay: guest.dueDay,
              status: guest.status,
            }
          : { ...EMPTY_VALUES, pgId: defaultPgId ?? '', roomId: defaultRoomId ?? '' },
      );
    }
  }, [open, guest, defaultPgId, defaultRoomId, reset]);

  async function onSubmit(values: GuestFormValues) {
    try {
      if (isEdit) {
        await updateGuest.mutateAsync({ ...guest, ...values });
        toast.success('Guest updated');
      } else {
        await createGuest.mutateAsync({ id: crypto.randomUUID(), ...values });
        toast.success('Guest added');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit guest' : 'Add guest'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>PG</Label>
              <Controller
                control={control}
                name="pgId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PG" />
                    </SelectTrigger>
                    <SelectContent>
                      {(pgs ?? []).map((pg) => (
                        <SelectItem key={pg.id} value={pg.id}>
                          {pg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.pgId && <p className="text-xs text-error">{errors.pgId.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Room</Label>
              <Controller
                control={control}
                name="roomId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedPgId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {(rooms ?? []).map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roomId && <p className="text-xs text-error">{errors.roomId.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guest-name">Name</Label>
            <Input id="guest-name" {...register('name')} />
            {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-phone">Phone</Label>
              <Input id="guest-phone" {...register('phone')} />
              {errors.phone && <p className="text-xs text-error">{errors.phone.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-joining">Joining date</Label>
              <Input id="guest-joining" type="date" {...register('joiningDate')} />
              {errors.joiningDate && (
                <p className="text-xs text-error">{errors.joiningDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-rent">Monthly rent</Label>
              <Input id="guest-rent" type="number" min={1} {...register('monthlyRent')} />
              {errors.monthlyRent && (
                <p className="text-xs text-error">{errors.monthlyRent.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-deposit">Deposit</Label>
              <Input id="guest-deposit" type="number" min={0} {...register('deposit')} />
              {errors.deposit && <p className="text-xs text-error">{errors.deposit.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-dueday">Due day</Label>
              <Input id="guest-dueday" type="number" min={1} max={28} {...register('dueDay')} />
              {errors.dueDay && <p className="text-xs text-error">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="NOTICE">Notice</SelectItem>
                    <SelectItem value="LEFT">Left</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Save changes' : 'Add guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
