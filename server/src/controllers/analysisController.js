import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { aiFetch } from '../services/aiClient.js';

export async function analyzeResume(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return res.status(422).json({ success: false, error: { message: 'No retained text for this resume (retention disabled or empty). Re-upload with text retention enabled.' } });
    }
    const result = await aiFetch('/analyze-resume', { body: { text: resume.extractedText }, timeoutMs: 90000 });
    const doc = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      overallScore: result.overall_score,
      categoryScores: result.category_scores,
      skills: result.skills,
      skillsByCategory: result.skills_by_category,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      atsFindings: result.ats_findings,
      sectionFeedback: result.section_feedback,
      keywordCoverage: result.keyword_coverage,
      analysisMethod: result.analysis_method
    });
    res.status(201).json({ success: true, data: { analysis: doc, raw: result } });
  } catch (e) { next(e); }
}

export async function getAnalysis(req, res, next) {
  try {
    const a = await Analysis.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!a) return res.status(404).json({ success: false, error: { message: 'Analysis not found' } });
    res.json({ success: true, data: { analysis: a } });
  } catch (e) { next(e); }
}

export async function history(req, res, next) {
  try {
    const items = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('resumeId', 'title originalFilename createdAt').lean();
    res.json({ success: true, data: { history: items } });
  } catch (e) { next(e); }
}
