import express from 'express';
import { uploadResume, listResumes, getResume, deleteResume } from '../controllers/resumeController.js';
import { authRequired } from '../middleware/auth.js';
import { validateObjectIdParam } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.use(authRequired);
router.post('/upload', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      const status = err.status || 400;
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max 5MB.' : (err.message || 'Upload failed');
      return res.status(status).json({ success: false, error: { message: msg } });
    }
    next();
  });
}, uploadResume);
router.get('/', listResumes);
router.get('/:id', validateObjectIdParam('id'), getResume);
router.delete('/:id', validateObjectIdParam('id'), deleteResume);
export default router;
