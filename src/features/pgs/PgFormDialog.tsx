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
import type { PgDto } from '@/api/types';
import { pgSchema, type PgFormValues } from './schemas';
import { useCreatePg, useUpdatePg } from './usePgs';

interface PgFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pg?: PgDto;
}

export function PgFormDialog({ open, onOpenChange, pg }: PgFormDialogProps) {
  const isEdit = !!pg;
  const createPg = useCreatePg();
  const updatePg = useUpdatePg();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PgFormValues>({
    resolver: zodResolver(pgSchema),
    defaultValues: { name: '', address: '', city: '' },
  });

  useEffect(() => {
    if (open)
      reset(
        pg
          ? { name: pg.name, address: pg.address, city: pg.city }
          : { name: '', address: '', city: '' },
      );
  }, [open, pg, reset]);

  async function onSubmit(values: PgFormValues) {
    try {
      if (isEdit) {
        await updatePg.mutateAsync({ ...pg, ...values });
        toast.success('PG updated');
      } else {
        await createPg.mutateAsync({ id: crypto.randomUUID(), ...values });
        toast.success('PG created');
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
          <DialogTitle>{isEdit ? 'Edit PG' : 'Add PG'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pg-name">Name</Label>
            <Input id="pg-name" {...register('name')} />
            {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pg-address">Address</Label>
            <Input id="pg-address" {...register('address')} />
            {errors.address && <p className="text-xs text-error">{errors.address.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pg-city">City</Label>
            <Input id="pg-city" {...register('city')} />
            {errors.city && <p className="text-xs text-error">{errors.city.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create PG'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
