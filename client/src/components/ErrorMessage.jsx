import { AlertOctagon } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="card" role="alert" style={{ borderLeft: '4px solid var(--red)' }}>
      <strong style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)' }}><AlertOctagon size={20} /> Something went wrong</strong>
      <p className="muted">{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}
