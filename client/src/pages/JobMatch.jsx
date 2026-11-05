import { useEffect, useState } from 'react';
import { Briefcase, Check, X } from 'lucide-react';
import api from '../services/api.js';
import SkillBadge from '../components/SkillBadge.jsx';
import { useToast, errMsg } from '../context/ToastContext.jsx';

export default function JobMatch() {
  const { success, error } = useToast();
  const [resumes, setResumes] = useState([]);
  const [form, setForm] = useState({ resumeId: '', jobTitle: '', jobDescription: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/api/resumes').then((r) => { setResumes(r.data.data.resumes); if (r.data.data.resumes[0]) setForm((f) => ({ ...f, resumeId: r.data.data.resumes[0]._id })); }).catch(() => {}); }, []);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setResult(null);
    try { const r = await api.post('/api/jobs/match', form); setResult(r.data.data); success(`Match: ${r.data.data.match.matchScore}%`); }
    catch (e) { error(errMsg(e, 'Match failed')); } finally { setBusy(false); }
  };
  return (
    <div className="grid">
      <h2 style={{ margin: 0 }}>Job description matching</h2>
      <div className="card card-glow">
        <p className="muted" style={{ marginTop: 0 }}>Explainable TF-IDF + skill overlap. Not a hiring probability. Suggestions encourage truthful tailoring only.</p>
        <form onSubmit={submit} className="grid">
          <label>Resume<select className="select" value={form.resumeId} onChange={(e) => setForm({ ...form, resumeId: e.target.value })} required>{resumes.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}</select></label>
          <label>Job title (optional)<input className="input" placeholder="e.g. Frontend Engineer" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></label>
          <label>Job description<textarea className="textarea" placeholder="Paste job description (min 50 chars)…" required minLength={50} value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} /></label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Matching…' : 'Compare'}</button>
        </form>
      </div>
      {result && (
        <div className="card card-glow">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><Briefcase size={20} /> Alignment: <span className="gradient-text">{result.match.matchScore}%</span></h3>
          <div className="grid grid-2" style={{ marginTop: 16 }}>
            <div className="card" style={{ borderLeft: '4px solid var(--green)', background: 'var(--card-soft)' }}>
              <p style={{ fontWeight: 700, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)' }}><Check size={18} /> Matched skills</p>
              <div>{result.match.matchedSkills.length ? result.match.matchedSkills.map((s) => <SkillBadge key={s} skill={s} />) : <span className="muted">None</span>}</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--amber)', background: 'var(--card-soft)' }}>
              <p style={{ fontWeight: 700, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)' }}><X size={18} /> Missing skills (prioritized)</p>
              <div>{result.match.missingSkills.length ? result.match.missingSkills.map((s) => <SkillBadge key={s} skill={s} />) : <span className="muted">None</span>}</div>
            </div>
          </div>
          <p><strong>Missing keywords:</strong> <span className="muted">{result.match.missingKeywords.join(', ') || '—'}</span></p>
          <h4>Suggested changes</h4>
          <ol style={{ paddingLeft: 18, lineHeight: 1.9 }}>{result.match.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ol>
        </div>
      )}
    </div>
  );
}
