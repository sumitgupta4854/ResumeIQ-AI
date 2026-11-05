import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { JobMatch } from '../models/JobMatch.js';

export async function stats(req, res, next) {
  try {
    const [resumes, analyses, matches] = await Promise.all([
      Resume.countDocuments({ userId: req.user._id }),
      Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean(),
      JobMatch.countDocuments({ userId: req.user._id })
    ]);
    const scores = analyses.map(a => a.overallScore);
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const latest = analyses[0] || null;
    const allSkills = new Set();
    analyses.slice(0, 10).forEach(a => (a.skills || []).forEach(s => allSkills.add(s)));
    const history = analyses.slice(0, 10).map(a => ({
      date: a.createdAt, score: a.overallScore, id: a._id, resumeId: a.resumeId
    })).reverse();
    res.json({
      success: true,
      data: {
        totalResumes: resumes,
        totalAnalyses: analyses.length,
        totalMatches: matches,
        averageScore: avg,
        latestScore: latest?.overallScore ?? null,
        skillCoverage: allSkills.size,
        recentHistory: analyses.slice(0, 5),
        scoreTrend: history,
        nextSteps: buildNextSteps(latest)
      }
    });
  } catch (e) { next(e); }
}

function buildNextSteps(latest) {
  if (!latest) return ['Upload your first resume to get an AI score', 'Add a job description to check keyword alignment'];
  const steps = [];
  const recs = latest.recommendations || [];
  recs.slice(0, 3).forEach(r => steps.push(r));
  if ((latest.weaknesses || []).length) steps.push(`Address weakness: ${latest.weaknesses[0]}`);
  steps.push('Paste a target job description in Job Match to prioritize fixes');
  return steps.slice(0, 5);
}
