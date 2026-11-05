import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongoUri || env.mongoUri.includes('YOUR_USERNAME')) {
    throw new Error('MONGODB_URI is a placeholder. Set a valid MongoDB connection string in server/.env (see README + .env.example).');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ MongoDB connected:', mongoose.connection.host);
  return mongoose.connection;
}
