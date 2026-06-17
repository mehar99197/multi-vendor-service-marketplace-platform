import mongoose from 'mongoose';

// Cache the connection (and the in-flight promise) on globalThis. On a serverless
// platform like Vercel each warm invocation reuses one connection instead of opening
// a new one per request — otherwise Atlas's connection limit is quickly exhausted.
// On a long-running local server this simply connects once and reuses it.
let cached = globalThis._mongooseCache;
if (!cached) {
  cached = globalThis._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI environment variable');
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false, // fail fast instead of silently queueing queries
        maxPoolSize: 10, // small pool; many warm instances may each hold one
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // reset so the next request can retry (never process.exit in serverless)
    throw err;
  }
  return cached.conn;
};

export default connectDB;
