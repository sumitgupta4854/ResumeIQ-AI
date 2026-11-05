import { useMemo, useState } from 'react';
import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../services/api.js';
import { useToast, errMsg } from '../context/ToastContext.jsx';
import CandidateCard from '../components/CandidateCard.jsx';
import CandidateProfileModal from '../components/CandidateProfileModal.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

const EXAMPLES = [
  'I need a Python developer with Django, React, SQL, and 2-3 years of experience.',
  'Senior data scientist with Python, machine learning, SQL, 5+ years, based in Bangalore, full-time.',
  'Frontend developer with React, TypeScript, CSS, a bachelor degree, remote, 3-5 years, $90k-$120k.'
];

const CRITERIA = [
  ['job_role', 'Job Role'],
  ['skills', 'Required Skills'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['location', 'Preferred Location'],
  ['employment_type', 'Employment Type'],
  ['salary', 'Salary Expectations']
];

function criteriaValue(req, key) {
  const v = req?.[key];
  if (key === 'skills') return Array.isArray(v) && v.length ? v.join(', ') : '';
  if (key === 'experience') return v?.raw || '';
  return typeof v === 'string' ? v : '';
}

export default function CandidateSearch() {
  const { success, error } = useToast();
  const [requirements, setRequirements] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [modal, setModal] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const visible = useMemo(() => {
    const list = result?.candidates || [];
    return list.filter((c) => c.matchScore >= minScore && (!onlyShortlisted || c.shortlisted));
  }, [result, minScore, onlyShortlisted]);

  const search = async (e) => {
    e?.preventDefault();
    if (requirements.trim().length < 10) { error('Describe the role in at least 10 characters.'); return; }
    setBusy(true); setErr(''); setResult(null);
    try {
      const r = await api.post('/api/candidates/search', { requirements });
      setResult(r.data.data);
    } catch (e) { setErr(errMsg(e, 'Candidate search failed. Is the AI service running?')); }
    finally { setBusy(false); }
  };

  const toggleShortlist = async (candidate) => {
    try {
      const r = await api.post(`/api/candidates/${candidate.userId}/shortlist`);
      const now = r.data.data.shortlisted;
      setResult((prev) => prev ? { ...prev, candidates: prev.candidates.map((c) => (c.userId === candidate.userId ? { ...c, shortlisted: now } : c)) } : prev);
      setModal((m) => (m && m.userId === candidate.userId ? { ...m, shortlisted: now } : m));
      success(now ? 'Candidate shortlisted' : 'Removed from shortlist');
    } catch (e) { error(errMsg(e, 'Could not update shortlist')); }
  };

  const downloadResume = async (candidate) => {
    setDownloadingId(candidate.userId);
    try {
      const r = await api.get(`/api/candidates/${candidate.userId}/resume`);
      const blob = new Blob([r.data.data.text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.data.data.filename || 'resume.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { error(errMsg(e, 'Could not download resume')); }
    finally { setDownloadingId(null); }
  };

  return (
    <div className="grid">
      <div>
        <h2 style={{ margin: 0 }}>AI Candidate Search</h2>
        <p className="muted" style={{ marginTop: 6 }}>Describe who you are hiring in plain language — the system extracts the requirements and ranks real candidate profiles from the database by matching score.</p>
      </div>

      <div className="card card-glow">
        <form onSubmit={search} className="grid">
          <label>Hiring requirements
            <textarea
              className="textarea"
              placeholder="e.g. I need a Python developer with Django, React, SQL, and 2-3 years of experience."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              maxLength={20000}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="badge" style={{ cursor: 'pointer' }} onClick={() => setRequirements(ex)}>
                {ex.length > 46 ? `${ex.slice(0, 46)}…` : ex}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>
            <Sparkles size={16} /> {busy ? 'Analyzing & matching…' : 'Find candidates'}
          </button>
        </form>
      </div>

      {busy && <div className="card"><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><Search size={18} /><strong>Analyzing requirements and scanning the candidate pool…</strong></div><LoadingSkeleton lines={4} /></div>}

      {err && !busy && <ErrorMessage message={err} onRetry={search} />}

      {result && !busy && (
        <>
          {result.requirements && (
            <div className="card card-glow">
              <h3 style={{ marginTop: 0 }}>Understanding your requirements</h3>
              <div className="criteria-grid">
                {CRITERIA.map(([key, label]) => {
                  const val = criteriaValue(result.requirements, key);
                  return (
                    <div className="criteria-chip" key={key}>
                      <span className="k">{label}</span>
                      <span className="v">{val || <span className="muted">Not specified</span>}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <div className="filter-bar">
              <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SlidersHorizontal size={17} /> {visible.length} of {result.candidates.length} candidates</strong>
              <span className="muted" style={{ fontSize: 12.5 }}>Scanned {result.poolSize} resumes from the database</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                Min match
                <input type="range" min="0" max="100" step="5" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
                <span className="badge">{minScore}%</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" checked={onlyShortlisted} onChange={(e) => setOnlyShortlisted(e.target.checked)} />
                Shortlisted only
              </label>
            </div>
          </div>

          {!result.candidates.length ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted" style={{ margin: 0 }}>No candidate resumes found in the database yet. Candidates appear once job seekers upload their resumes.</p>
            </div>
          ) : !visible.length ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted" style={{ margin: 0 }}>No candidates match the current filters. Try lowering the minimum match score.</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {visible.map((c) => (
                <CandidateCard
                  key={c.userId}
                  candidate={c}
                  onView={setModal}
                  onDownload={downloadResume}
                  onShortlist={toggleShortlist}
                  downloading={downloadingId === c.userId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <CandidateProfileModal
          candidate={modal}
          onClose={() => setModal(null)}
          onDownload={downloadResume}
          onShortlist={toggleShortlist}
          downloading={downloadingId === modal.userId}
        />
      )}
    </div>
  );
}
