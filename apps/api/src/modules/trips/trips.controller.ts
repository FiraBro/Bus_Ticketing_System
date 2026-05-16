import { Request, Response } from 'express';
import { TripsService } from './trips.service';
import { createTripSchema, searchTripSchema } from './trips.dto';

const tripsService = new TripsService();

export class TripsController {
  async create(req: Request, res: Response) {
    const data = createTripSchema.parse(req.body);
    const trip = await tripsService.createTrip(data);
    res.status(201).json({ status: 'success', data: { trip } });
  }

  async search(req: Request, res: Response) {
    const query = searchTripSchema.parse(req.query);
    const trips = await tripsService.getTrips(query);
    res.status(200).json({ status: 'success', data: { trips } });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const trip = await tripsService.getTripById(id as string);
    res.status(200).json({ status: 'success', data: { trip } });
  }
}
