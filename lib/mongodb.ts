import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URL = process.env.MONGODB_URL || '';

  if (!MONGODB_URL) {
    throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Connection pool settings for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
      // Aggressive timeout settings for mobile - fail fast
      serverSelectionTimeoutMS: 1500, // Reduced to 1.5 seconds
      socketTimeoutMS: 20000, // Reduced to 20 seconds
      connectTimeoutMS: 1500, // Reduced to 1.5 seconds
      // Keep alive settings for faster reconnection
      heartbeatFrequencyMS: 10000, // Check connection health every 10s
      // Use IPv4, skip trying IPv6 (faster on mobile)
      family: 4,
      // Direct connection for faster initial connection
      directConnection: false, // Use replica set if available
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
