import dotenv from 'dotenv';
dotenv.config();
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

export default app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(env.port, () => console.log(`🚀 ResumeIQ server on http://localhost:${env.port}`));
}
