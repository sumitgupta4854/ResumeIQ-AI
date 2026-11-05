export default function ResumeSectionFeedback({ feedback = {} }) {
  const entries = Object.entries(feedback);
  if (!entries.length) return null;
  return (<div className="grid grid-2">{entries.map(([k, v]) => (<div key={k} className="card"><strong style={{ textTransform: 'capitalize' }}>{k}</strong><p className="muted">{String(v)}</p></div>))}</div>);
}
