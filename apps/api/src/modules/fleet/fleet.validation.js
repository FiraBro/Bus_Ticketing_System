import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema Definition
// ---------------------------------------------------------------------------

export const createBusSchema = z.object({
  body: z.object({
    code: z
      .string({ required_error: "Bus code is required." })
      .trim()
      .min(2, "Bus code must be at least 2 characters long.")
      .max(20, "Bus code must not exceed 20 characters."),
    
    type: z.enum(["AC", "sleeper", "seater"], {
      required_error: "Bus type must be one of: AC, sleeper, seater.",
    }),
    
    seat_layout: z
      .array(
        z.object({
          seat_number: z
            .string({ required_error: "Seat number is required." })
            .trim()
            .min(1, "Seat number cannot be empty."),
          row: z
            .number({ required_error: "Row number is required." })
            .nonnegative("Row index cannot be negative."),
          col: z
            .number({ required_error: "Column number is required." })
            .nonnegative("Column index cannot be negative."),
        }),
        { required_error: "Seat layout is required." }
      )
      .min(1, "Seat layout must contain at least one seat.")
      .refine(
        (seats) => {
          const numbers = seats.map((s) => s.seat_number.toLowerCase());
          return new Set(numbers).size === numbers.length;
        },
        { message: "Seat layout contains duplicate seat numbers." }
      )
      .refine(
        (seats) => {
          const positions = seats.map((s) => `${s.row}-${s.col}`);
          return new Set(positions).size === positions.length;
        },
        { message: "Seat layout contains duplicate seat row/col positions." }
      ),
  }),
});
