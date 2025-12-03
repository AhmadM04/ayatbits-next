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
      minPoolSize: 5,
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Keep alive
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
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
