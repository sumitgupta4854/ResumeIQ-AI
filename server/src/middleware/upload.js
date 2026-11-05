import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(here, '..', '..', 'uploads');
try { fs.mkdirSync(uploadDir, { recursive: true }); } catch { /* ignore */ }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = path.extname(file.originalname).toLowerCase();
  if ((allowed.includes(file.mimetype) || ['.pdf', '.docx'].includes(ext))) return cb(null, true);
  cb(Object.assign(new Error('Only PDF and DOCX files are allowed'), { status: 400 }));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMB * 1024 * 1024, files: 1 }
});
