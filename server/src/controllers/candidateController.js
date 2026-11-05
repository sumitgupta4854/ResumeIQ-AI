import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { aiFetch } from '../services/aiClient.js';

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || 'C';
}

// Search the real candidate pool (any user with a retained-text resume) via the AI service.
export async function searchCandidates(req, res, next) {
  try {
    const { requirements } = req.body;

    // Candidate pool: every other user's resumes (exclude the searcher themselves).
    const poolUsers = await User.find({ _id: { $ne: req.user._id } }).select('name email').lean();
    const userIds = poolUsers.map((u) => u._id);
    const resumes = await Resume.find({ userId: { $in: userIds } })
      .select('userId title extractedText createdAt')
      .lean();
    const usable = resumes.filter((r) => (r.extractedText || '').trim().length >= 50);
    if (!usable.length) {
      return res.json({ success: true, data: { requirements: null, candidates: [], poolSize: 0 } });
    }

    const payload = usable.map((r) => ({
      id: String(r._id),
      user_id: String(r.userId),
      title: r.title || '',
      text: r.extractedText
    }));
    const ai = await aiFetch('/match-candidates', { body: { requirements, resumes: payload }, timeoutMs: 90000 });

    const userById = new Map(poolUsers.map((u) => [String(u._id), u]));
    const resumeById = new Map(usable.map((r) => [String(r._id), r]));
    const shortlisted = new Set((req.user.shortlistedCandidates || []).map(String));

    // Keep the best-matching resume per candidate.
    const best = new Map();
    for (const c of ai.candidates || []) {
      const uid = String(c.user_id || resumeById.get(String(c.id))?.userId || '');
      if (!uid) continue;
      const current = best.get(uid);
      if (!current || c.match_score > current.match_score) best.set(uid, c);
    }

    const candidates = [...best.values()]
      .sort((a, b) => b.match_score - a.match_score)
      .map((c) => {
        const uid = String(c.user_id);
        const user = userById.get(uid) || {};
        const resume = resumeById.get(String(c.id)) || {};
        const profile = c.profile || {};
        return {
          userId: uid,
          name: user.name || 'Candidate',
          email: user.email || '',
          avatar: initials(user.name || ''),
          jobTitle: profile.job_title || 'Candidate',
          skills: profile.skills || [],
          skillsByCategory: profile.skills_by_category || {},
          experienceYears: profile.experience_years ?? null,
          education: profile.education || '',
          degree: profile.degree || '',
          location: profile.location || '',
          summary: profile.summary || '',
          resume: {
            id: String(c.id),
            title: resume.title || 'Resume',
            preview: (resume.extractedText || '').slice(0, 600)
          },
          matchScore: c.match_score,
          breakdown: c.breakdown || {},
          notes: c.notes || {},
          matchedSkills: c.matched_skills || [],
          missingSkills: c.missing_skills || [],
          shortlisted: shortlisted.has(uid)
        };
      });

    res.json({ success: true, data: { requirements: ai.requirements, candidates, poolSize: usable.length, method: ai.method } });
  } catch (e) { next(e); }
}

// Toggle a candidate in the recruiter's shortlist (stored on the existing User model).
export async function toggleShortlist(req, res, next) {
  try {
    const { userId } = req.params;
    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: { message: 'You cannot shortlist yourself.' } });
    }
    const candidate = await User.findOne({ _id: userId }).select('_id').lean();
    if (!candidate) return res.status(404).json({ success: false, error: { message: 'Candidate not found' } });

    const list = (req.user.shortlistedCandidates || []).map(String);
    const idx = list.indexOf(String(userId));
    let shortlisted;
    if (idx >= 0) { list.splice(idx, 1); shortlisted = false; } else { list.push(String(userId)); shortlisted = true; }
    req.user.shortlistedCandidates = list;
    await req.user.save();
    res.json({ success: true, data: { shortlisted, count: list.length } });
  } catch (e) { next(e); }
}

export async function listShortlisted(req, res, next) {
  try {
    const ids = req.user.shortlistedCandidates || [];
    if (!ids.length) return res.json({ success: true, data: { candidates: [] } });
    const users = await User.find({ _id: { $in: ids } }).select('name email').lean();
    const resumes = await Resume.find({ userId: { $in: ids } }).select('userId title').sort({ createdAt: -1 }).lean();
    const latestResume = new Map();
    for (const r of resumes) {
      const key = String(r.userId);
      if (!latestResume.has(key)) latestResume.set(key, r.title);
    }
    const order = ids.map(String);
    const candidates = users
      .sort((a, b) => order.indexOf(String(a._id)) - order.indexOf(String(b._id)))
      .map((u) => ({
        userId: String(u._id),
        name: u.name,
        email: u.email,
        avatar: initials(u.name),
        resumeTitle: latestResume.get(String(u._id)) || '',
        shortlisted: true
      }));
    res.json({ success: true, data: { candidates } });
  } catch (e) { next(e); }
}

// Full retained resume text for the Download Resume / View Profile actions.
export async function getCandidateResume(req, res, next) {
  try {
    const { userId } = req.params;
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 }).select('title extractedText originalFilename').lean();
    if (!resume || !resume.extractedText) {
      return res.status(404).json({ success: false, error: { message: 'No resume available for this candidate' } });
    }
    const user = await User.findById(userId).select('name').lean();
    const safeName = (user?.name || 'candidate').replace(/[^\w]+/g, '_');
    res.json({
      success: true,
      data: {
        filename: `${safeName}_resume.txt`,
        title: resume.title,
        text: resume.extractedText
      }
    });
  } catch (e) { next(e); }
}
