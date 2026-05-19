import catchAsync from "../../core/utils/catchAsync.js";
import { createBus, getAllBuses } from "./fleet.service.js";

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
// Create Bus Handler
// ---------------------------------------------------------------------------
export const createBusHandler = catchAsync(async (req, res) => {
  const bus = await createBus(req.body);
  sendResponse(res, 201, { bus }, "Bus profile created successfully.");
});

// ---------------------------------------------------------------------------
// List Buses Handler
// ---------------------------------------------------------------------------
export const listBusesHandler = catchAsync(async (req, res) => {
  const buses = await getAllBuses();
  sendResponse(res, 200, { buses });
});
