import express from 'express';
import { analyzeResume, getAnalysis, history } from '../controllers/analysisController.js';
import { authRequired } from '../middleware/auth.js';
import { validateObjectIdParam } from '../middleware/validate.js';

const router = express.Router();
router.use(authRequired);
router.get('/history', history);
router.post('/:resumeId', validateObjectIdParam('resumeId'), analyzeResume);
router.get('/:id', validateObjectIdParam('id'), getAnalysis);
export default router;
