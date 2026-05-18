import mongoose from "mongoose";
import { env } from "./env.js";

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Connection pool — enough for an MVP, tune later with real traffic
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected [${env.NODE_ENV}]`);
  } catch (error) {
    if (attempt >= RETRY_ATTEMPTS) {
      console.error("❌ MongoDB connection failed after max retries. Exiting.");
      process.exit(1);
    }
    console.warn(
      `⚠️  MongoDB connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

export async function connectDatabase() {
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected.");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });

  await connectWithRetry();
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log("MongoDB disconnected gracefully.");
}
