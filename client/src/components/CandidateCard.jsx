import { Briefcase, GraduationCap, MapPin, Download, Eye, Mail, Bookmark, BookmarkCheck, FileText } from 'lucide-react';
import SkillBadge from './SkillBadge.jsx';

const GRADS = ['var(--grad-primary)', 'var(--grad-cool)', 'var(--grad-warm)', 'var(--grad-lime)', 'var(--grad-sunset)'];

function gradFor(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return GRADS[h % GRADS.length];
}

function scoreStyle(score) {
  if (score >= 75) return { background: 'var(--grad-lime)' };
  if (score >= 55) return { background: 'var(--grad-primary)' };
  if (score >= 35) return { background: 'var(--grad-warm)' };
  return { background: 'linear-gradient(135deg,#ef4444,#b91c1c)' };
}

const BREAKDOWN_LABELS = [
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['location', 'Location'],
  ['content', 'Resume fit']
];

export default function CandidateCard({ candidate, onView, onDownload, onShortlist, downloading }) {
  const expText = candidate.experienceYears == null ? 'Not stated' : `${candidate.experienceYears} yrs experience`;
  const educationText = candidate.degree || candidate.education || 'Not stated';
  return (
    <div className="card candidate-card">
      <div className="candidate-head">
        <span className="avatar" style={{ background: gradFor(candidate.name) }}>{candidate.avatar}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.name}</h3>
          <span className="muted" style={{ fontSize: 13.5, fontWeight: 600 }}>{candidate.jobTitle}</span>
        </div>
        <span className="match-pill" style={scoreStyle(candidate.matchScore)}>{candidate.matchScore}% match</span>
      </div>

      <div className="match-meta">
        <span className="m"><Briefcase size={15} /> {expText}</span>
        <span className="m"><GraduationCap size={15} /> {educationText}</span>
        <span className="m"><MapPin size={15} /> {candidate.location || 'Not stated'}</span>
      </div>

      {candidate.skills?.length > 0 && (
        <div>
          <div className="muted" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 6 }}>Top skills</div>
          <div>{candidate.skills.slice(0, 8).map((s) => <SkillBadge key={s} skill={s} />)}{candidate.skills.length > 8 && <span className="badge">+{candidate.skills.length - 8}</span>}</div>
        </div>
      )}

      <div className="score-bars">
        {BREAKDOWN_LABELS.map(([key, label]) => {
          const val = candidate.breakdown?.[key];
          if (val == null) return null;
          return (
            <div className="row" key={key}>
              <span className="muted">{label}</span>
              <span className="mini-progress"><div style={{ width: `${val}%` }} /></span>
              <span style={{ textAlign: 'right', fontWeight: 700 }}>{val}%</span>
            </div>
          );
        })}
      </div>

      {candidate.matchedSkills?.length > 0 && (
        <div>
          <div className="muted" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 6 }}>Matched requirements</div>
          <div>{candidate.matchedSkills.map((s) => <SkillBadge key={s} skill={s} />)}</div>
        </div>
      )}

      <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <FileText size={15} /> {candidate.resume?.title || 'Resume'}
      </div>

      <div className="candidate-actions">
        <button className="btn" onClick={() => onView(candidate)}><Eye size={15} /> View Profile</button>
        <button className="btn" onClick={() => onDownload(candidate)} disabled={downloading}><Download size={15} /> {downloading ? 'Preparing…' : 'Download Resume'}</button>
        <button className={`btn ${candidate.shortlisted ? 'btn-primary' : ''}`} onClick={() => onShortlist(candidate)}>
          {candidate.shortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
        <a className="btn" href={`mailto:${candidate.email}?subject=${encodeURIComponent(`Opportunity for ${candidate.jobTitle} role`)}`}><Mail size={15} /> Contact Candidate</a>
      </div>
    </div>
  );
}
