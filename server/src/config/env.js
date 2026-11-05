import dotenv from 'dotenv';
dotenv.config();

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  port: num(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_analyzer',
  jwtSecret: process.env.JWT_SECRET || 'dev_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  pythonAiUrl: (process.env.PYTHON_AI_URL || 'http://localhost:8001').replace(/\/$/, ''),
  maxFileSizeMB: num(process.env.MAX_FILE_SIZE_MB, 5),
  retainText: String(process.env.RETAIN_RESUME_TEXT || 'true').toLowerCase() !== 'false',
  nodeEnv: process.env.NODE_ENV || 'development'
};
