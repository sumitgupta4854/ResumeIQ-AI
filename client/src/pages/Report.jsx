import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Lightbulb, ClipboardCheck } from 'lucide-react';
import api from '../services/api.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const BAR_GRADS = ['var(--grad-primary)', 'var(--grad-cool)', 'var(--grad-warm)', 'var(--grad-lime)', 'var(--grad-sunset)'];

export default function Report() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get(`/api/analysis/${id}`).then((r) => setA(r.data.data.analysis)).catch((e) => setErr(e?.response?.data?.error?.message || 'Failed to load report'));
  }, [id]);
  if (err) return <ErrorMessage message={err} />;
  if (!a) return <LoadingSkeleton lines={8} />;
  const cats = a.categoryScores ? Object.entries(a.categoryScores) : [];
  return (
    <div className="grid">
      <div className="card card-glow">
        <ScoreGauge score={a.overallScore} />
        <p className="muted" style={{ marginBottom: 0 }}>Method: {a.analysisMethod} · {new Date(a.createdAt).toLocaleString()}</p>
      </div>
      <div className="card card-glow">
        <h3 style={{ marginTop: 0 }}>Category scores (with evidence)</h3>
        <div className="grid grid-2">
          {cats.map(([k, v], i) => (
            <div key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</strong>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{v}/100</span>
              </div>
              <div className="progress"><div style={{ width: `${v}%`, background: BAR_GRADS[i % BAR_GRADS.length] }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green)' }}><CheckCircle2 size={20} /> Strengths</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>{(a.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--amber)' }}><AlertTriangle size={20} /> Weaknesses</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>{(a.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>
      <div className="card card-glow">
        <h3 style={{ marginTop: 0 }}>Skills ({(a.skills || []).length})</h3>
        <div>{(a.skills || []).map((s) => <SkillBadge key={s} skill={s} />)}</div>
        {a.skillsByCategory && Object.entries(a.skillsByCategory).map(([c, v]) => <p key={c} className="muted"><strong>{c}:</strong> {(v || []).join(', ')}</p>)}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><ClipboardCheck size={20} /> ATS findings</h3>
        <pre className="muted" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg-soft)', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>{JSON.stringify(a.atsFindings, null, 2)}</pre>
      </div>
      <div className="card card-glow">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><Lightbulb size={20} /> Actionable recommendations &amp; roadmap</h3>
        <ol style={{ paddingLeft: 18, lineHeight: 1.9 }}>{(a.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}</ol>
      </div>
    </div>
  );
}
