import { prisma } from '../../config/db';
import { z } from 'zod';
import { createTripSchema, searchTripSchema } from './trips.dto';
import { NotFoundError } from '../../core/errors/AppError';

export class TripsService {
  async createTrip(data: z.infer<typeof createTripSchema>) {
    return prisma.trip.create({
      data,
    });
  }

  async getTrips(query: z.infer<typeof searchTripSchema>) {
    const whereClause: any = {};
    if (query.origin) whereClause.origin = { contains: query.origin, mode: 'insensitive' };
    if (query.destination) whereClause.destination = { contains: query.destination, mode: 'insensitive' };
    
    if (query.date) {
      const startOfDay = new Date(query.date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

      whereClause.departureTime = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    return prisma.trip.findMany({
      where: whereClause,
      include: {
        bus: true,
      },
      orderBy: { departureTime: 'asc' },
    });
  }

  async getTripById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { bus: { include: { seats: true } }, bookings: true },
    });

    if (!trip) throw new NotFoundError('Trip not found');
    return trip;
  }
}
