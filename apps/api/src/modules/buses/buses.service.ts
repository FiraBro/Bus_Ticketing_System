import { prisma } from '../../config/db';
import { z } from 'zod';
import { createBusSchema } from './buses.dto';

export class BusesService {
  async createBus(data: z.infer<typeof createBusSchema>) {
    return prisma.bus.create({
      data,
    });
  }

  async getAllBuses() {
    return prisma.bus.findMany();
  }
}
