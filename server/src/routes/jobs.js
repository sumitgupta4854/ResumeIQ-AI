import express from 'express';
import { matchJob, listMatches, getMatch } from '../controllers/jobController.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectIdParam } from '../middleware/validate.js';
import { jobMatchSchema } from '../utils/validators.js';

const router = express.Router();
router.use(authRequired);
router.post('/match', validate(jobMatchSchema), matchJob);
router.get('/matches', listMatches);
router.get('/matches/:id', validateObjectIdParam('id'), getMatch);
export default router;
