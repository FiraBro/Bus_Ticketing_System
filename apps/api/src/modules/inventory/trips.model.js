import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Trip Schema Definition
// ---------------------------------------------------------------------------
const tripSchema = new mongoose.Schema(
  {
    route_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "A trip must reference a valid Route."],
    },
    bus_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "A trip must reference a valid Bus from the Fleet catalog."],
    },
    departure_time: {
      type: Date,
      required: [true, "A trip must have a departure date and time."],
    },
    arrival_time: {
      type: Date,
      required: [true, "A trip must have an arrival date and time."],
    },
    price: {
      type: Number,
      required: [true, "A trip must have a ticket price."],
      min: [0.01, "Price must be a positive number greater than 0."],
    },
    status: {
      type: String,
      required: [true, "A trip must have a status."],
      enum: {
        values: ["active", "cancelled", "completed"],
        message: "Trip status must be active, cancelled, or completed.",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// Index on foreign keys for fast populates/lookups
tripSchema.index({ route_id: 1 });
tripSchema.index({ bus_id: 1 });

// Compound index on schedule timings for fast listing and searching
tripSchema.index({ departure_time: 1, arrival_time: 1 });

// ---------------------------------------------------------------------------
// Model Definition
// ---------------------------------------------------------------------------
const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
