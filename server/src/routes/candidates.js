import express from 'express';
import { searchCandidates, toggleShortlist, listShortlisted, getCandidateResume } from '../controllers/candidateController.js';
import { authRequired } from '../middleware/auth.js';
import { validate, validateObjectIdParam } from '../middleware/validate.js';
import { candidateSearchSchema } from '../utils/validators.js';

const router = express.Router();
router.use(authRequired);
router.post('/search', validate(candidateSearchSchema), searchCandidates);
router.get('/shortlisted', listShortlisted);
router.get('/:userId/resume', validateObjectIdParam('userId'), getCandidateResume);
router.post('/:userId/shortlist', validateObjectIdParam('userId'), toggleShortlist);
export default router;
