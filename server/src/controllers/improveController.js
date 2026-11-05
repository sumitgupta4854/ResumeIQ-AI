import { Resume } from '../models/Resume.js';
import { aiFetch } from '../services/aiClient.js';

async function resolveText(req) {
  if (req.body.resumeText) return req.body.resumeText;
  const r = await Resume.findOne({ _id: req.body.resumeId, userId: req.user._id });
  if (!r) { const e = new Error('Resume not found'); e.status = 404; throw e; }
  return r.extractedText;
}

export async function improveSummary(req, res, next) {
  try {
    const result = await aiFetch('/improve-resume', { body: { task: 'summary', original: req.body.summary, job_description: req.body.jobDescription || null } });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function improveBullet(req, res, next) {
  try {
    const result = await aiFetch('/improve-resume', { body: { task: 'bullet', original: req.body.bullet, job_description: req.body.jobDescription || null } });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function improveResume(req, res, next) {
  try {
    const text = await resolveText(req);
    const result = await aiFetch('/improve-resume', { body: { task: 'general', original: text.slice(0, 12000), job_description: req.body.jobDescription || null } });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}
