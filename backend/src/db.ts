import { connectDb } from "@workspace/db";
import { logger } from "./lib/logger";

/**
 * MongoDB is required — the API serves no fallback data. The server refuses
 * to start when MONGODB_URI is missing.
 */
export async function initDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set — MongoDB is required. Set MONGODB_URI in backend/.env",
    );
  }

  await connectDb(uri);
  logger.info("Connected to MongoDB Atlas");
}
