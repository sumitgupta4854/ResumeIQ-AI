import express from 'express';
import { improveSummary, improveBullet, improveResume } from '../controllers/improveController.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { improveSummarySchema, improveBulletSchema, improveResumeSchema } from '../utils/validators.js';

const router = express.Router();
router.use(authRequired);
router.post('/summary', validate(improveSummarySchema), improveSummary);
router.post('/bullet', validate(improveBulletSchema), improveBullet);
router.post('/resume', validate(improveResumeSchema), improveResume);
export default router;
