import multer from 'multer';
import path from 'node:path';
import { env } from '../config/env.js';

function fileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = path.extname(file.originalname).toLowerCase();
  if ((allowed.includes(file.mimetype) || ['.pdf', '.docx'].includes(ext))) return cb(null, true);
  cb(Object.assign(new Error('Only PDF and DOCX files are allowed'), { status: 400 }));
}

// Keep uploads in memory: the serverless filesystem (Vercel) is read-only.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.maxFileSizeMB * 1024 * 1024, files: 1 }
});
