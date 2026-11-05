import { useState } from 'react';
import { Wand2, Copy, Check } from 'lucide-react';
import api from '../services/api.js';
import { useToast, errMsg } from '../context/ToastContext.jsx';

function CopyButton({ text }) {
  const { success } = useToast();
  const [done, setDone] = useState(false);
  return (
    <button className="btn" onClick={() => { navigator.clipboard.writeText(text); success('Copied!'); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
    </button>
  );
}

function SideBySide({ original, suggestions, why }) {
  return (
    <div className="grid grid-2">
      <div className="card" style={{ borderTop: '4px solid var(--muted)' }}>
        <h4 style={{ marginTop: 0 }}>Original</h4>
        <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{original}</p>
      </div>
      <div className="card" style={{ borderTop: '4px solid var(--green)', background: 'var(--card-soft)' }}>
        <h4 style={{ marginTop: 0, color: 'var(--green)' }}>Suggested</h4>
        {(suggestions || []).map((s, i) => (
          <div key={i} style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <p style={{ margin: 0 }}>{s}</p>
            <CopyButton text={s} />
          </div>
        ))}
        <p className="muted"><strong>Why:</strong> {why}</p>
      </div>
    </div>
  );
}

export default function Improve() {
  const { error } = useToast();
  const [tab, setTab] = useState('summary');
  const [input, setInput] = useState('');
  const [jd, setJd] = useState('');
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setOut(null);
    try {
      const url = tab === 'summary' ? '/api/improve/summary' : '/api/improve/bullet';
      const body = tab === 'summary' ? { summary: input, jobDescription: jd || undefined } : { bullet: input, jobDescription: jd || undefined };
      const r = await api.post(url, body);
      setOut(r.data.data);
    } catch (e) { error(errMsg(e, 'Improve failed')); } finally { setBusy(false); }
  };
  return (
    <div className="grid">
      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}><Wand2 size={24} /> Improvement assistant</h2>
      <div className="card card-glow">
        <p className="muted" style={{ marginTop: 0 }}>Never invents jobs, degrees, or metrics. Fill bracketed placeholders with facts only.</p>
        <div style={{ display: 'inline-flex', gap: 4, marginBottom: 16, padding: 4, borderRadius: 999, background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
          <button className={`btn ${tab === 'summary' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setTab('summary')}>Summary</button>
          <button className={`btn ${tab === 'bullet' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setTab('bullet')}>Bullet</button>
        </div>
        <form onSubmit={submit} className="grid">
          <textarea className="textarea" required placeholder={tab === 'summary' ? 'Paste your summary…' : 'Paste one bullet…'} value={input} onChange={(e) => setInput(e.target.value)} />
          <textarea className="textarea" placeholder="Optional: paste JD to tailor wording…" value={jd} onChange={(e) => setJd(e.target.value)} />
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Rewriting…' : 'Improve'}</button>
        </form>
      </div>
      {out && <SideBySide original={out.original} suggestions={out.suggestions} why={out.why} />}
    </div>
  );
}
