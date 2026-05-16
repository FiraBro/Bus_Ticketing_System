import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// 1. Force load the env file BEFORE running the schema.
// Since you run from the monorepo root, this checks both possible locations:
dotenv.config({ path: path.resolve(process.cwd(), "apps/api/.env") }); // Workspace root execution
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Direct directory execution

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(), // Changed .url() to standard string if using local mongodb strings without a standard TLD format
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  REDIS_URL: z.string().optional(),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Environment validation failed:", parsed.error.format());
    return process.exit(1);
  }
  return parsed.data;
};

// 2. This will now evaluate perfectly because dotenv loaded the variables right above!
export const env = parseEnv();
