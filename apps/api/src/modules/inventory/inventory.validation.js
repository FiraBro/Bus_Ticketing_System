import { z } from "zod";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const objectIdValidator = z.string({ required_error: "ID is required." }).refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid MongoDB ObjectId format." }
);

const dateValidator = z.string({ required_error: "Date and time are required." }).refine(
  (val) => !isNaN(Date.parse(val)),
  { message: "Invalid date-time string format." }
);

// ---------------------------------------------------------------------------
// Route Validation
// ---------------------------------------------------------------------------
export const createRouteSchema = z.object({
  body: z.object({
    origin: z
      .string({ required_error: "Route origin is required." })
      .trim()
      .min(1, "Origin cannot be empty."),
    
    destination: z
      .string({ required_error: "Route destination is required." })
      .trim()
      .min(1, "Destination cannot be empty."),
    
    stops: z
      .array(
        z.object({
          name: z
            .string({ required_error: "Stop name is required." })
            .trim()
            .min(1, "Stop name cannot be empty."),
          order_index: z
            .number({ required_error: "Stop order index is required." })
            .nonnegative("Stop order index cannot be negative."),
        })
      )
      .optional()
      .default([])
      .refine(
        (stops) => {
          const names = stops.map((s) => s.name.toLowerCase());
          return new Set(names).size === names.length;
        },
        { message: "Stops contains duplicate stop names." }
      )
      .refine(
        (stops) => {
          const indices = stops.map((s) => s.order_index);
          return new Set(indices).size === indices.length;
        },
        { message: "Stops contains duplicate order indices." }
      ),
  }).refine(
    (data) => data.origin.toLowerCase() !== data.destination.toLowerCase(),
    { message: "Origin and destination cannot be the same.", path: ["destination"] }
  ),
});

// ---------------------------------------------------------------------------
// Trip Validation
// ---------------------------------------------------------------------------
export const createTripSchema = z.object({
  body: z.object({
    route_id: objectIdValidator,
    
    bus_id: objectIdValidator,
    
    departure_time: dateValidator,
    
    arrival_time: dateValidator,
    
    price: z
      .number({ required_error: "Ticket price is required." })
      .positive("Ticket price must be a positive number greater than 0."),
    
    status: z.enum(["active", "cancelled", "completed"]).optional().default("active"),
  }).refine(
    (data) => {
      const departure = new Date(data.departure_time);
      const arrival = new Date(data.arrival_time);
      return arrival > departure;
    },
    { message: "Arrival time must be chronologically after departure time.", path: ["arrival_time"] }
  ),
});
