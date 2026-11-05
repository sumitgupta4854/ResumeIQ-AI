import fs from 'node:fs/promises';
import path from 'node:path';
import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { JobMatch } from '../models/JobMatch.js';
import { env } from '../config/env.js';
import { aiFetch } from '../services/aiClient.js';
import { safeUnlink } from '../utils/files.js';

function extOf(filename) {
  return path.extname(filename || '').toLowerCase().replace('.', '');
}

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file uploaded. Attach a PDF or DOCX.' } });
    const tmpPath = req.file.path;
    const ext = extOf(req.file.originalname) === 'docx' ? 'docx' : 'pdf';
    try {
      const buf = await fs.readFile(tmpPath);
      // Send to AI service as base64 for safe transport
      const extracted = await aiFetch('/extract-text', {
        body: { filename: req.file.originalname, file_base64: buf.toString('base64') }
      });
      const text = (extracted?.text || '').slice(0, 100000);
      if (!text || text.trim().length < 50) {
        await safeUnlink(tmpPath);
        return res.status(422).json({ success: false, error: { message: 'Could not extract readable text. File may be scanned, encrypted, corrupt, or empty.' } });
      }
      const retain = req.user.preferences?.retainResumeText ?? env.retainText;
      const resume = await Resume.create({
        userId: req.user._id,
        title: path.basename(req.file.originalname, path.extname(req.file.originalname)).slice(0, 120),
        originalFilename: req.file.originalname,
        fileType: ext,
        fileSize: req.file.size,
        extractedText: retain ? text : '',
        textRetained: retain
      });
      await safeUnlink(tmpPath);
      res.status(201).json({ success: true, data: { resume, preview: text.slice(0, 2000), method: extracted?.method } });
    } catch (e) {
      await safeUnlink(tmpPath);
      throw e;
    }
  } catch (e) { next(e); }
}

export async function listResumes(req, res, next) {
  try {
    const items = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { resumes: items.map(r => ({ ...r, extractedText: undefined })) } });
  } catch (e) { next(e); }
}

export async function getResume(req, res, next) {
  try {
    const r = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!r) return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
    res.json({ success: true, data: { resume: r } });
  } catch (e) { next(e); }
}

export async function deleteResume(req, res, next) {
  try {
    const r = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
    await Analysis.deleteMany({ resumeId: r._id, userId: req.user._id });
    await JobMatch.deleteMany({ resumeId: r._id, userId: req.user._id });
    await r.deleteOne();
    res.json({ success: true, data: { message: 'Resume and related reports deleted' } });
  } catch (e) { next(e); }
}
