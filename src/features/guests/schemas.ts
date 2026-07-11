import { z } from 'zod';

export const guestSchema = z.object({
  pgId: z.string().min(1, 'PG is required'),
  roomId: z.string().min(1, 'Room is required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  monthlyRent: z.coerce.number().int().positive('Monthly rent must be positive'),
  deposit: z.coerce.number().int().min(0, 'Deposit cannot be negative'),
  dueDay: z.coerce
    .number()
    .int('Due day must be a whole number')
    .min(1, 'Due day must be between 1 and 28')
    .max(28, 'Due day must be between 1 and 28'),
  status: z.enum(['ACTIVE', 'NOTICE', 'LEFT']),
});
export type GuestFormInput = z.input<typeof guestSchema>;
export type GuestFormValues = z.output<typeof guestSchema>;
