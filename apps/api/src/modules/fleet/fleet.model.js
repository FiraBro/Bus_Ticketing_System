import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Seat Schema (Embedded)
// ---------------------------------------------------------------------------
const seatSchema = new mongoose.Schema(
  {
    seat_number: {
      type: String,
      required: [true, "Seat number is required."],
      trim: true,
    },
    row: {
      type: Number,
      required: [true, "Row number is required."],
      min: [0, "Row number cannot be negative."],
    },
    col: {
      type: Number,
      required: [true, "Column number is required."],
      min: [0, "Column number cannot be negative."],
    },
  },
  { _id: false } // Nested sub-document inside Bus, no separate ID needed
);

// ---------------------------------------------------------------------------
// Bus Schema Definition
// ---------------------------------------------------------------------------
const busSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A bus must have a unique code."],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, "A bus must have a type (AC, sleeper, seater)."],
      enum: {
        values: ["AC", "sleeper", "seater"],
        message: "Bus type must be either: AC, sleeper, or seater.",
      },
    },
    seat_layout: {
      type: [seatSchema],
      required: [true, "A bus must have a defined seat layout."],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Seat layout must have at least one seat.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
busSchema.index({ type: 1 });

// ---------------------------------------------------------------------------
// Model Definition
// ---------------------------------------------------------------------------
const Bus = mongoose.model("Bus", busSchema);

export default Bus;
