import dotenv from 'dotenv';
dotenv.config();

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production' || Boolean(process.env.VERCEL);

// Deployed endpoints (used as fallbacks in production when env vars are not set).
const PROD_FRONTEND_URL = 'https://resume-iq-ai-i5o5.vercel.app';
const PROD_AI_URL = 'https://resumeiq-ai-gtdr.onrender.com';

// Always allow the deployed frontend origin so the live app is never blocked by CORS,
// even if FRONTEND_URL is missing or stale in the hosting dashboard.
const configuredFrontend = process.env.FRONTEND_URL || (isProd ? PROD_FRONTEND_URL : 'http://localhost:5173');
const frontendOrigins = Array.from(new Set([
  ...configuredFrontend.split(',').map((s) => s.trim()).filter(Boolean),
  PROD_FRONTEND_URL
]));
const configuredMaxFileSizeMB = num(process.env.MAX_FILE_SIZE_MB, 5);

export const env = {
  port: num(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_analyzer',
  jwtSecret: process.env.JWT_SECRET || 'dev_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: frontendOrigins.join(','),
  pythonAiUrl: (process.env.PYTHON_AI_URL || (isProd ? PROD_AI_URL : 'http://localhost:8001')).replace(/\/$/, ''),
  maxFileSizeMB: process.env.VERCEL ? Math.min(configuredMaxFileSizeMB, 4) : configuredMaxFileSizeMB,
  retainText: String(process.env.RETAIN_RESUME_TEXT || 'true').toLowerCase() !== 'false',
  nodeEnv
};
