export default function ScoreGauge({ score = 0, size = 150 }) {
  const r = (size - 20) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const off = c - (pct / 100) * c;
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#7c3aed' : score >= 35 ? '#f59e0b' : '#ef4444';
  const gid = `gauge-grad-${Math.round(score)}`;
  return (
    <div className="gauge-wrap">
      <svg width={size} height={size} role="img" aria-label={`Score ${score} of 100`}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-soft)" strokeWidth="14" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gid})`} strokeWidth="14" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.9,.3,1)', filter: 'drop-shadow(0 6px 14px rgba(124,58,237,.35))' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="34" fontWeight="700" fontFamily="Space Grotesk, sans-serif" fill="var(--text)">{score}</text>
      </svg>
      <div>
        <div className="gauge-score">Overall score</div>
        <div className="muted">out of 100 · explainable rules</div>
      </div>
    </div>
  );
}
