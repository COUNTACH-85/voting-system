import mongoose from 'mongoose';

// Use local MongoDB by default, or environment variable if set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Atlas connection error:', error.message);
      console.error('Please check:');
      console.error('1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Your MongoDB Atlas credentials are correct');
      console.error('3. Your network allows connections to MongoDB Atlas');
      cached.promise = null; // Reset promise on error
      throw error;
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