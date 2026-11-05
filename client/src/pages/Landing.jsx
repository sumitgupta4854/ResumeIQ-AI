import { Link } from 'react-router-dom';
import { Upload, Target, Wand2, ShieldCheck, BarChart3, FileCheck, Sparkles } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge.jsx';

const FEATURES = [
  { t: 'Upload & extract', d: 'PDF/DOCX parsing with clear errors for scanned or encrypted files.', icon: <Upload size={22} />, grad: 'var(--grad-primary)' },
  { t: 'Explainable score', d: 'ATS, structure, experience, skills — every score has evidence.', icon: <BarChart3 size={22} />, grad: 'var(--grad-cool)' },
  { t: 'Job matching', d: 'TF-IDF + skill overlap shows matched and missing skills.', icon: <Target size={22} />, grad: 'var(--grad-warm)' },
  { t: 'Improvement assistant', d: 'Rewrite summaries and bullets side-by-side, copy in one click.', icon: <Wand2 size={22} />, grad: 'var(--grad-lime)' },
  { t: 'Privacy first', d: 'Temp files cleaned, text retention is optional, per-user isolation.', icon: <ShieldCheck size={22} />, grad: 'var(--grad-sunset)' },
  { t: 'Real analytics', d: 'Dashboard reads from MongoDB — no fake demo numbers.', icon: <FileCheck size={22} />, grad: 'var(--grad-primary)' }
];

const STEPS = [
  'Upload PDF/DOCX → text extracted by the Python service.',
  'Node.js stores your resume and requests transparent analysis.',
  'Get score, skills, ATS findings and a roadmap.',
  'Paste a JD → see alignment plus truthful fixes.'
];

export default function Landing() {
  return (
    <div className="container">
      <section className="hero">
        <span className="eyebrow"><Sparkles size={15} /> Powered by explainable, local analysis</span>
        <h1>Resumes that get <span className="gradient-text">read</span>,<br />scores you can <span className="gradient-text">trust</span>.</h1>
        <p>ResumeIQ AI extracts your resume text, scores it with explainable checks, matches it to job descriptions, and helps you improve — no paid API needed.</p>
        <div className="hero-cta">
          <Link className="btn btn-primary" to="/register">Analyze my resume</Link>
          <Link className="btn" to="/login">I have an account</Link>
        </div>
        <div className="hero-stats">
          {[['100', 'point scoring'], ['TF-IDF', 'skill matching'], ['6', 'score categories'], ['PDF · DOCX', 'formats supported']].map(([n, l]) => (
            <div key={l}><span className="stat-num gradient-text">{n}</span><span className="stat-label">{l}</span></div>
          ))}
        </div>
      </section>

      <section className="section grid grid-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="card feature">
            <div className="feature-icon" style={{ background: f.grad }}>{f.icon}</div>
            <h3>{f.t}</h3>
            <p className="muted">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="section card card-glow">
        <h2 style={{ marginTop: 0 }}>How it works</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={i}><span className="step-num">{i + 1}</span><span style={{ paddingTop: 7 }}>{s}</span></li>
          ))}
        </ol>
      </section>

      <section className="section grid grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Sample score visualization</h3>
          <ScoreGauge score={78} />
          <p className="muted">Sample only — your score is computed from your resume.</p>
        </div>
        <div className="card faq">
          <h3 style={{ marginTop: 0 }}>FAQ</h3>
          <details><summary>Do I need a paid API?</summary><p className="muted">No. Baseline is local rule-based + TF-IDF. LLM is optional via env vars.</p></details>
          <details><summary>Is this a real ATS score?</summary><p className="muted">No. We show heuristic readability checks and say so explicitly.</p></details>
          <details><summary>Where is my data stored?</summary><p className="muted">MongoDB per-user records. Disable text retention in Settings. Delete anytime.</p></details>
        </div>
      </section>

      <footer className="footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span className="brand"><span className="brand-text">ResumeIQ AI</span></span>
          <span>© 2026 ResumeIQ AI</span>
          <span><Link to="/login">Login</Link> · <Link to="/register">Register</Link></span>
        </div>
      </footer>
    </div>
  );
}
