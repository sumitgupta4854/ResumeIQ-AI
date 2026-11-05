import express from 'express';
import { stats } from '../controllers/dashboardController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
router.get('/stats', authRequired, stats);
export default router;
