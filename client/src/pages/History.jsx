import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Upload } from 'lucide-react';
import api from '../services/api.js';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import { useToast, errMsg } from '../context/ToastContext.jsx';

export default function History() {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('resumes');
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/api/analysis/history'),
        api.get('/api/jobs/matches')
      ]);
      setItems(r1.data.data.history);
      setMatches(r2.data.data.matches);
    } catch (e) { error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);
  const doDelete = async () => {
    setBusy(true);
    try { await api.delete(`/api/resumes/${del.resumeId._id || del.resumeId}`); success('Deleted resume + reports'); setDel(null); load(); }
    catch (e) { error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="grid">
      <h2 style={{ margin: 0 }}>History</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'resumes' ? 'btn-primary' : ''}`} onClick={() => setTab('resumes')}>Resume Analysis</button>
        <button className={`btn ${tab === 'recruitment' ? 'btn-primary' : ''}`} onClick={() => setTab('recruitment')}>Recruitment Search</button>
      </div>

      {tab === 'resumes' ? (
        !items.length ? (
          <div className="card card-glow" style={{ textAlign: 'center', padding: 48 }}>
            <div className="dropzone-icon" style={{ background: 'var(--grad-cool)' }}><HistoryIcon size={28} /></div>
            <p className="muted">No analyses yet. Upload your first resume to begin.</p>
            <Link className="btn btn-primary" to="/app/upload"><Upload size={16} /> Upload</Link>
          </div>
        ) : (
          <div className="card card-glow">
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr><th>Date</th><th>Resume</th><th>Score</th><th>Skills</th><th>Method</th><th></th></tr></thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a._id}>
                      <td className="muted">{new Date(a.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{a.resumeId?.title || '—'}</td>
                      <td><Link className="badge" to={`/app/report/${a._id}`} style={{ fontSize: 13 }}>{a.overallScore}</Link></td>
                      <td className="muted">{(a.skills || []).length}</td>
                      <td className="muted">{a.analysisMethod}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link className="btn" to={`/app/report/${a._id}`}>View</Link>
                        <button className="btn btn-danger" onClick={() => setDel(a)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        !matches.length ? (
          <div className="card card-glow" style={{ textAlign: 'center', padding: 48 }}>
            <div className="dropzone-icon" style={{ background: 'var(--grad-sunset)' }}><HistoryIcon size={28} /></div>
            <p className="muted">No job matches yet. Try the Job Match tool to align a resume with a job description.</p>
            <Link className="btn btn-primary" to="/app/jobs"><Upload size={16} /> Job Match</Link>
          </div>
        ) : (
          <div className="card card-glow">
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr><th>Date</th><th>Role</th><th>Resume</th><th>Match Score</th><th>Matched Skills</th></tr></thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m._id}>
                      <td className="muted">{new Date(m.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{m.jobTitle || 'Untitled role'}</td>
                      <td className="muted">{m.resumeId?.title || '—'}</td>
                      <td><span className="badge">{m.matchScore}%</span></td>
                      <td className="muted">{(m.matchedSkills || []).length} matched</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
      {del && <ConfirmDeleteModal title="Delete resume?" message={`Delete "${del.resumeId?.title}" and all its reports?`} onCancel={() => setDel(null)} onConfirm={doDelete} busy={busy} />}
    </div>
  );
}
