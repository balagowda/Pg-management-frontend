import { z } from 'zod';

export const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  capacity: z.coerce
    .number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1'),
});
// z.coerce fields have a different input type (e.g. string from an <input>)
// than output type (number) — RHF's useForm needs both generics wired up so
// register()'d fields type-check against the input shape.
export type RoomFormInput = z.input<typeof roomSchema>;
export type RoomFormValues = z.output<typeof roomSchema>;
