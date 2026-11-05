import crypto from 'node:crypto';
import { Resume } from '../models/Resume.js';
import { JobMatch } from '../models/JobMatch.js';
import { aiFetch } from '../services/aiClient.js';
import { env } from '../config/env.js';

export async function matchJob(req, res, next) {
  try {
    const { resumeId, jobTitle = '', jobDescription } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
    if (!resume.extractedText) return res.status(422).json({ success: false, error: { message: 'Resume text not retained' } });
    const result = await aiFetch('/match-job', { body: { resume_text: resume.extractedText, job_description: jobDescription } });
    const retain = req.user.preferences?.retainResumeText ?? env.retainText;
    const doc = await JobMatch.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobTitle,
      jobDescriptionHash: crypto.createHash('sha256').update(jobDescription).digest('hex'),
      jobDescriptionExcerpt: retain ? jobDescription.slice(0, 2000) : jobDescription.slice(0, 300),
      matchScore: result.match_score,
      matchedSkills: result.matched_skills,
      missingSkills: result.missing_skills,
      missingKeywords: result.missing_keywords,
      recommendations: result.recommendations
    });
    res.status(201).json({ success: true, data: { match: doc, raw: result } });
  } catch (e) { next(e); }
}

export async function listMatches(req, res, next) {
  try {
    const items = await JobMatch.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('resumeId', 'title').lean();
    res.json({ success: true, data: { matches: items } });
  } catch (e) { next(e); }
}

export async function getMatch(req, res, next) {
  try {
    const m = await JobMatch.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!m) return res.status(404).json({ success: false, error: { message: 'Match not found' } });
    res.json({ success: true, data: { match: m } });
  } catch (e) { next(e); }
}
