import Route from "./routes.model.js";
import Trip from "./trips.model.js";
import { getBusById } from "../fleet/fleet.service.js";
import AppError from "../../core/utils/AppError.js";

// ---------------------------------------------------------------------------
// Route Services
// ---------------------------------------------------------------------------

export const createRoute = async (routeData) => {
  const originFormatted = routeData.origin.trim();
  const destinationFormatted = routeData.destination.trim();
  
  if (originFormatted.toLowerCase() === destinationFormatted.toLowerCase()) {
    throw new AppError("Origin and destination routes cannot be the same.", 400);
  }
  
  // Sort stops by order_index before saving to guarantee ordering in DB
  const sortedStops = routeData.stops 
    ? [...routeData.stops].sort((a, b) => a.order_index - b.order_index) 
    : [];
    
  const newRoute = await Route.create({
    origin: originFormatted,
    destination: destinationFormatted,
    stops: sortedStops,
  });
  
  return newRoute;
};

export const getAllRoutes = async () => {
  return await Route.find().sort({ createdAt: -1 });
};

// ---------------------------------------------------------------------------
// Trip Services
// ---------------------------------------------------------------------------

export const createTrip = async (tripData) => {
  const departure = new Date(tripData.departure_time);
  const arrival = new Date(tripData.arrival_time);
  
  // 1. Chronological validation
  if (arrival <= departure) {
    throw new AppError("Arrival time must be chronologically after departure time.", 400);
  }
  
  // 2. Validate route existence
  const route = await Route.findById(tripData.route_id);
  if (!route) {
    throw new AppError("The referenced Route does not exist.", 404);
  }
  
  // 3. Cross-module verification: Call Fleet Module's service method
  const bus = await getBusById(tripData.bus_id);
  if (!bus) {
    throw new AppError("The scheduled Bus does not exist in the Fleet catalog.", 404);
  }
  
  // 4. Save Trip
  const newTrip = await Trip.create({
    route_id: tripData.route_id,
    bus_id: tripData.bus_id,
    departure_time: departure,
    arrival_time: arrival,
    price: tripData.price,
    status: tripData.status || "active",
  });
  
  return newTrip;
};

export const getTripById = async (tripId) => {
  // Populate both the route and bus details for a complete representation
  const trip = await Trip.findById(tripId)
    .populate("route_id")
    .populate("bus_id");
    
  if (!trip) {
    throw new AppError("Trip not found.", 404);
  }
  
  return trip;
};

export const getAllTrips = async () => {
  return await Trip.find()
    .populate("route_id")
    .populate("bus_id")
    .sort({ departure_time: 1 });
};
