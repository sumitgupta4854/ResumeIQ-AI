import { Link } from 'react-router-dom';

export default function ResumeHistoryTable({ items = [], onDelete }) {
  return (
    <div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Date</th><th>Resume</th><th>Score</th><th></th></tr></thead><tbody>
      {items.map((a) => (<tr key={a._id}><td>{new Date(a.createdAt).toLocaleString()}</td><td>{a.resumeId?.title || '—'}</td><td><Link to={`/app/report/${a._id}`}>{a.overallScore}</Link></td><td>{onDelete && <button className="btn btn-danger" onClick={() => onDelete(a)}>Delete</button>}</td></tr>))}
    </tbody></table></div>
  );
}
