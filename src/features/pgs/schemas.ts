import { z } from 'zod';

export const pgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
});
export type PgFormValues = z.infer<typeof pgSchema>;
