export default function ScoreCard({ label, value, hint, icon, grad = 'var(--grad-primary)' }) {
  return (
    <div className="card stat-card">
      {icon && <div className="stat-icon" style={{ background: grad }}>{icon}</div>}
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
      {hint && <span className="muted" style={{ fontSize: 13 }}>{hint}</span>}
    </div>
  );
}
