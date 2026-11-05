import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const app = createApp();
let ready = false;

connectDB()
  .then(() => { ready = true; })
  .catch((e) => {
    console.error('❌ MongoDB connection failed:', e.message);
    console.error('👉 Fix: copy server/.env.example to server/.env and set a valid MONGODB_URI (local or Atlas). Server still serves /api/health.');
  });

app.get('/ready', (req, res) => {
  res.json({ ready, mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(env.port, () => console.log(`🚀 ResumeIQ server on http://localhost:${env.port}`));
