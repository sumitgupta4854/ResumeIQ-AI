import { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, MapPin, Mail, Download, Bookmark, BookmarkCheck, FileText, X } from 'lucide-react';
import api from '../services/api.js';
import SkillBadge from './SkillBadge.jsx';

export default function CandidateProfileModal({ candidate, onClose, onDownload, onShortlist, downloading }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr('');
    api.get(`/api/candidates/${candidate.userId}/resume`)
      .then((r) => { if (alive) setText(r.data.data.text); })
      .catch(() => { if (alive) setErr('Resume text is not available for this candidate.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [candidate.userId]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${candidate.name} profile`} onClick={onClose}>
      <div className="card" style={{ maxWidth: 720, width: '94%', maxHeight: '88vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>{candidate.name}</h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>{candidate.jobTitle}</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="match-meta" style={{ marginTop: 16 }}>
          <span className="m"><Briefcase size={15} /> {candidate.experienceYears == null ? 'Not stated' : `${candidate.experienceYears} yrs experience`}</span>
          <span className="m"><GraduationCap size={15} /> {candidate.degree || candidate.education || 'Not stated'}</span>
          <span className="m"><MapPin size={15} /> {candidate.location || 'Not stated'}</span>
          <span className="m"><Mail size={15} /> {candidate.email}</span>
        </div>

        {candidate.skills?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Skills</h4>
            <div>{candidate.skills.map((s) => <SkillBadge key={s} skill={s} />)}</div>
          </div>
        )}

        {candidate.matchedSkills?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Matched requirements</h4>
            <div>{candidate.matchedSkills.map((s) => <SkillBadge key={s} skill={s} />)}</div>
          </div>
        )}

        <h4 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={17} /> Resume</h4>
        {loading ? <div className="skeleton" style={{ height: 160 }} />
          : err ? <p className="muted">{err}</p>
            : <pre className="muted" style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto', background: 'var(--bg-soft)', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>{text}</pre>}

        <div className="candidate-actions" style={{ marginTop: 18 }}>
          <button className="btn" onClick={() => onDownload(candidate)} disabled={downloading}><Download size={15} /> {downloading ? 'Preparing…' : 'Download Resume'}</button>
          <button className={`btn ${candidate.shortlisted ? 'btn-primary' : ''}`} onClick={() => onShortlist(candidate)}>
            {candidate.shortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
          </button>
          <a className="btn" href={`mailto:${candidate.email}?subject=${encodeURIComponent(`Opportunity for ${candidate.jobTitle} role`)}`}><Mail size={15} /> Contact</a>
        </div>
      </div>
    </div>
  );
}
