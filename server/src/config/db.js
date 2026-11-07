import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise;

export async function connectDB() {
  if (!env.mongoUri || env.mongoUri.includes('YOUR_USERNAME')) {
    throw new Error('MONGODB_URI is a placeholder. Set a valid MongoDB connection string in server/.env (see README + .env.example).');
  }

  if (process.env.VERCEL && /127\.0\.0\.1|localhost/.test(env.mongoUri)) {
    throw new Error('MONGODB_URI is not configured for the Vercel deployment.');
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      connectionPromise = null;
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}
