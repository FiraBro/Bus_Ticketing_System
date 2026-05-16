import { z } from 'zod';

export const createBusSchema = z.object({
  name: z.string().min(2),
  plateNumber: z.string().min(2),
  type: z.enum(['AC', 'NON_AC', 'SLEEPER']),
  capacity: z.number().positive(),
});
