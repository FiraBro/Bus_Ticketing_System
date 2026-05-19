import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Stop Schema (Embedded)
// ---------------------------------------------------------------------------
const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stop name is required."],
      trim: true,
    },
    order_index: {
      type: Number,
      required: [true, "Stop order index is required."],
      min: [0, "Stop order index cannot be negative."],
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Route Schema Definition
// ---------------------------------------------------------------------------
const routeSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: [true, "Route origin is required."],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Route destination is required."],
      trim: true,
    },
    stops: {
      type: [stopSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// Index on origin/destination for faster route searches
routeSchema.index({ origin: 1, destination: 1 });

// ---------------------------------------------------------------------------
// Model Definition
// ---------------------------------------------------------------------------
const Route = mongoose.model("Route", routeSchema);

export default Route;
