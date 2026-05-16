import "dotenv/config";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/db";
import app from "./app";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────
  // Finish in-flight requests before closing — important for bookings & payments
  async function shutdown(signal: string): Promise<void> {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log("Server closed.");
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Unhandled promise rejections — log and exit (let the process manager restart)
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
  });
}

bootstrap();
