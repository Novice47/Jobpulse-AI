import mongoose from 'mongoose';
import { config } from '../config/env.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.warn(`[MongoDB] Remote/local connection (${config.mongoUri}) unavailable (${error.message}). Starting standalone In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Successfully connected to In-Memory MongoDB: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Failed to start In-Memory MongoDB:', memErr);
      throw error;
    }
  }
}
