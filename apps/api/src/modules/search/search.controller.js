import catchAsync from "../../core/utils/catchAsync.js";
import { searchTrips } from "./search.service.js";
import { getAllTrips } from "../inventory/inventory.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sendResponse = (res, statusCode, data = null, message = null) => {
  return res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
    ...(data && { data }),
  });
};

// ---------------------------------------------------------------------------
// Search Trips Handler
// ---------------------------------------------------------------------------
export const searchTripsHandler = catchAsync(async (req, res) => {
  const { origin, destination, date, maxPrice, busType, departureTimeWindow } = req.query;

  // Graceful fallback: If no search query params are supplied, return the generic catalog
  if (!origin && !destination && !date) {
    const trips = await getAllTrips();
    return sendResponse(res, 200, { trips });
  }

  // Execute search service
  const trips = await searchTrips({
    origin,
    destination,
    date,
    maxPrice,
    busType,
    departureTimeWindow,
  });

  return sendResponse(res, 200, { trips });
});
