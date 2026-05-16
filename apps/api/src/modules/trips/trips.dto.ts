import { z } from 'zod';

export const createTripSchema = z.object({
  busId: z.string().uuid(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  price: z.number().positive(),
});

export const searchTripSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().datetime().optional(), // Expected to be a start of day ISO string
});
