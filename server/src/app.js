import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import analysisRoutes from './routes/analysis.js';
import jobRoutes from './routes/jobs.js';
import improveRoutes from './routes/improve.js';
import dashboardRoutes from './routes/dashboard.js';
import candidateRoutes from './routes/candidates.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl.split(','), credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true });
  app.use('/api/', limiter);
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 });
  app.use('/api/auth/', authLimiter);

  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        service: 'resumeiq-server',
        status: 'ok',
        message: 'ResumeIQ AI API is running. Use the endpoints below.',
        endpoints: ['/api/health', '/ready', '/api/auth', '/api/resumes', '/api/analysis', '/api/jobs', '/api/improve', '/api/dashboard', '/api/candidates']
      }
    });
  });

  app.get('/favicon.ico', (req, res) => res.status(204).end());

  app.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'resumeiq-server', time: new Date().toISOString() } });
  });

  app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'resumeiq-server', time: new Date().toISOString() } });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/improve', improveRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/candidates', candidateRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const app = createApp();

export default app;