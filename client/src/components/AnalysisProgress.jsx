export default function AnalysisProgress({ percent = 50, label = 'Analyzing…' }) {
  return (<div className="card" role="status" aria-label={label}><strong>{label}</strong><div className="progress" style={{ marginTop: 10 }}><div style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div></div>);
}
