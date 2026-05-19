import catchAsync from "../../core/utils/catchAsync.js";
import {
  createRoute,
  createTrip,
  getTripById,
  getAllTrips,
  getAllRoutes,
} from "./inventory.service.js";

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
// Route Handlers
// ---------------------------------------------------------------------------

export const createRouteHandler = catchAsync(async (req, res) => {
  const route = await createRoute(req.body);
  sendResponse(res, 201, { route }, "Route created successfully.");
});

export const listRoutesHandler = catchAsync(async (req, res) => {
  const routes = await getAllRoutes();
  sendResponse(res, 200, { routes });
});

// ---------------------------------------------------------------------------
// Trip Handlers
// ---------------------------------------------------------------------------

export const createTripHandler = catchAsync(async (req, res) => {
  const trip = await createTrip(req.body);
  sendResponse(res, 201, { trip }, "Trip scheduled successfully.");
});

export const getTripByIdHandler = catchAsync(async (req, res) => {
  const trip = await getTripById(req.params.id);
  sendResponse(res, 200, { trip });
});

export const listTripsHandler = catchAsync(async (req, res) => {
  const trips = await getAllTrips();
  sendResponse(res, 200, { trips });
});
