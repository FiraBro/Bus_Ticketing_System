import Bus from "./fleet.model.js";
import AppError from "../../core/utils/AppError.js";

// ---------------------------------------------------------------------------
// Create Bus
// ---------------------------------------------------------------------------
export const createBus = async (busData) => {
  const codeFormatted = busData.code.toUpperCase().trim();
  
  // Enforce unique bus code validation
  const existingBus = await Bus.findOne({ code: codeFormatted });
  if (existingBus) {
    throw new AppError(`Bus with code '${codeFormatted}' already exists in fleet catalog.`, 409);
  }
  
  const newBus = await Bus.create({
    ...busData,
    code: codeFormatted,
  });
  
  return newBus;
};

// ---------------------------------------------------------------------------
// Get All Buses
// ---------------------------------------------------------------------------
export const getAllBuses = async () => {
  return await Bus.find().sort({ createdAt: -1 });
};

// ---------------------------------------------------------------------------
// Get Bus By ID (Public service interface for inter-module integration)
// ---------------------------------------------------------------------------
export const getBusById = async (busId) => {
  return await Bus.findById(busId);
};
