import Route from "../inventory/routes.model.js";
import Trip from "../inventory/trips.model.js";
import Bus from "../fleet/fleet.model.js";

// ---------------------------------------------------------------------------
// Search Trips Service
// ---------------------------------------------------------------------------
export const searchTrips = async ({
  origin,
  destination,
  date,
  maxPrice,
  busType,
  departureTimeWindow,
}) => {
  // 1. Route Pre-matching
  // Find all routes that contain both the origin and destination (case-insensitive)
  const candidateRoutes = await Route.find({
    $and: [
      {
        $or: [
          { origin: { $regex: new RegExp(`^${origin}$`, "i") } },
          { "stops.name": { $regex: new RegExp(`^${origin}$`, "i") } },
        ],
      },
      {
        $or: [
          { destination: { $regex: new RegExp(`^${destination}$`, "i") } },
          { "stops.name": { $regex: new RegExp(`^${destination}$`, "i") } },
        ],
      },
    ],
  });

  // 2. Sequential Stops Directional Filter
  // Ensure origin order_index is strictly less than destination order_index
  const matchingRouteIds = candidateRoutes
    .filter((route) => {
      let originIndex = -1; // -1 represents the main origin boundary
      if (route.origin.toLowerCase() !== origin.toLowerCase()) {
        const stop = route.stops.find(
          (s) => s.name.toLowerCase() === origin.toLowerCase()
        );
        if (!stop) return false;
        originIndex = stop.order_index;
      }

      let destIndex = Infinity; // Infinity represents the main destination boundary
      if (route.destination.toLowerCase() !== destination.toLowerCase()) {
        const stop = route.stops.find(
          (s) => s.name.toLowerCase() === destination.toLowerCase()
        );
        if (!stop) return false;
        destIndex = stop.order_index;
      }

      return originIndex < destIndex;
    })
    .map((route) => route._id);

  // Fail fast: If no matching routes go in the correct direction, return early
  if (matchingRouteIds.length === 0) {
    return [];
  }

  // 3. Build Trip Query Filter
  const tripQuery = {
    route_id: { $in: matchingRouteIds },
    status: "active", // Only display active scheduled trips to customers
  };

  // 4. Handle Travel Date and Optional Departure Time Windows
  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(searchDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Restrict bounds further if time-of-day window filter is active
  if (departureTimeWindow) {
    if (departureTimeWindow === "morning") {
      startOfDay.setUTCHours(6, 0, 0, 0);
      endOfDay.setUTCHours(12, 0, 0, 0);
    } else if (departureTimeWindow === "afternoon") {
      startOfDay.setUTCHours(12, 0, 0, 0);
      endOfDay.setUTCHours(18, 0, 0, 0);
    } else if (departureTimeWindow === "evening") {
      startOfDay.setUTCHours(18, 0, 0, 0);
      endOfDay.setUTCHours(23, 59, 59, 999);
    }
  }

  tripQuery.departure_time = { $gte: startOfDay, $lte: endOfDay };

  // 5. Apply Max Ticket Price Filter
  if (maxPrice) {
    tripQuery.price = { $lte: Number(maxPrice) };
  }

  // 6. Apply Bus Type Filter (Resolves matching buses first, then filters trips)
  if (busType) {
    const matchingBuses = await Bus.find({ type: busType }).select("_id");
    const matchingBusIds = matchingBuses.map((b) => b._id);
    tripQuery.bus_id = { $in: matchingBusIds };
  }

  // 7. Query and Populate resolved details
  const trips = await Trip.find(tripQuery)
    .populate("route_id")
    .populate("bus_id")
    .sort({ departure_time: 1 });

  return trips;
};
