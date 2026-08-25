import mongoose from "mongoose";

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
};

let connectPromise: Promise<typeof mongoose> | null = null;

/**
 * Connect to MongoDB (e.g. MongoDB Atlas). Idempotent — safe to call
 * more than once. Throws if the server cannot be reached within
 * `serverSelectionTimeoutMS`.
 */
export function connectDb(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (!connectPromise) {
    connectPromise = mongoose.connect(uri, CONNECT_OPTIONS);
  }
  return connectPromise;
}

/** Disconnect from MongoDB. Used on shutdown. */
export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  connectPromise = null;
}

/** True when mongoose is currently connected to a MongoDB instance. */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export { mongoose };
export * from "./models";
