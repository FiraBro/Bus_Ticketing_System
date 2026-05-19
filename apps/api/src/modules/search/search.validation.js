import { z } from "zod";

// ---------------------------------------------------------------------------
// Search Query Schema
// ---------------------------------------------------------------------------
export const searchQuerySchema = z.object({
  query: z.object({
    origin: z
      .string({
        required_error: "Origin is required for searching trips.",
        invalid_type_error: "Origin is required for searching trips.",
      })
      .trim()
      .min(1, "Origin cannot be empty."),

    destination: z
      .string({
        required_error: "Destination is required for searching trips.",
        invalid_type_error: "Destination is required for searching trips.",
      })
      .trim()
      .min(1, "Destination cannot be empty."),

    date: z
      .string({
        required_error: "Travel date is required for searching trips.",
        invalid_type_error: "Travel date is required for searching trips.",
      })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Travel date must be a valid date string (e.g. YYYY-MM-DD).",
      }),

    maxPrice: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)) && Number(val) > 0, {
        message: "maxPrice must be a positive number.",
      }),

    busType: z
      .enum(["AC", "sleeper", "seater"], {
        errorMap: () => ({ message: "busType must be either: AC, sleeper, or seater." }),
      })
      .optional(),

    departureTimeWindow: z
      .enum(["morning", "afternoon", "evening"], {
        errorMap: () => ({ message: "departureTimeWindow must be either: morning, afternoon, or evening." }),
      })
      .optional(),
  }),
});
