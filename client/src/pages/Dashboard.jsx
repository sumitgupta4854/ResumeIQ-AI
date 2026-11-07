import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { FileText, ScanSearch, Target, Sparkles, Users, Upload } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ScoreGauge from '../components/ScoreGauge.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const BAR_COLORS = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true); setErr('');
    try { const r = await api.get('/api/dashboard/stats'); setData(r.data.data); }
    catch (e) { setErr(e?.response?.data?.error?.message || 'Failed to load dashboard'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="grid"><LoadingSkeleton lines={6} /></div>;
  if (err) return <ErrorMessage message={err} onRetry={load} />;
  const trend = (data.scoreTrend || []).map((t) => ({ date: new Date(t.date).toLocaleDateString(), score: t.score }));
  const cats = data.recentHistory?.[0]?.categoryScores ? Object.entries(data.recentHistory[0].categoryScores).map(([k, v]) => ({ name: k, score: v })) : [];
  const stats = [
    { l: 'Resumes', v: data.totalResumes, icon: <FileText size={20} />, grad: 'var(--grad-primary)' },
    { l: 'Analyses', v: data.totalAnalyses, icon: <ScanSearch size={20} />, grad: 'var(--grad-cool)' },
    { l: 'Avg score', v: data.averageScore, icon: <Target size={20} />, grad: 'var(--grad-warm)' },
    { l: 'Skills', v: data.skillCoverage, icon: <Sparkles size={20} />, grad: 'var(--grad-lime)' }
  ];
  return (
    <div className="grid">
      <h2 style={{ margin: 0 }}>Welcome back, {user?.name}</h2>
      <div className="grid grid-2">
        <div className="card dashboard-feature dashboard-feature-resume">
          <span className="dashboard-feature-label"><span className="dashboard-feature-icon"><FileText size={17} /></span> Resume Analysis</span>
          <h3 style={{ margin: '8px 0 4px', fontSize: 22 }}>Score &amp; improve your resume</h3>
          <p style={{ margin: '0 0 16px' }}>Upload a resume to get an AI score, skill gaps and improvement suggestions.</p>
          <Link className="btn btn-primary" to="/app/upload"><Upload size={16} /> Upload Resume</Link>
        </div>
        <div className="card dashboard-feature dashboard-feature-candidates">
          <span className="dashboard-feature-label"><span className="dashboard-feature-icon"><Users size={17} /></span> AI Candidate Search</span>
          <h3 style={{ margin: '8px 0 4px', fontSize: 22 }}>Find the right candidates</h3>
          <p style={{ margin: '0 0 16px' }}>Describe your hiring needs in plain language and rank matching candidates from the database.</p>
          <Link className="btn btn-primary" to="/app/candidates"><Sparkles size={16} /> Find Candidates</Link>
        </div>
      </div>
      <div className="grid grid-4">
        {stats.map((s) => (
          <div key={s.l} className="card stat-card">
            <div className="stat-icon" style={{ background: s.grad }}>{s.icon}</div>
            <span className="stat-num">{s.v ?? 0}</span>
            <span className="stat-label">{s.l}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card card-glow"><h3 style={{ marginTop: 0 }}>Latest score</h3>{data.latestScore == null ? <p className="muted">No analyses yet. <Link to="/app/upload">Upload a resume</Link>.</p> : <ScoreGauge score={data.latestScore} />}</div>
        <div className="card card-glow"><h3 style={{ marginTop: 0 }}>Score trend</h3>{trend.length ? <ResponsiveContainer width="100%" height={220}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" stroke="var(--muted)" /><YAxis domain={[0, 100]} stroke="var(--muted)" /><Tooltip contentStyle={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} /><Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={4} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer> : <p className="muted">Analyze 2+ resumes to see progress.</p>}</div>
      </div>
      <div className="grid grid-2">
        <div className="card card-glow"><h3 style={{ marginTop: 0 }}>Latest category breakdown</h3>{cats.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={cats}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="name" interval={0} angle={-20} height={60} fontSize={11} stroke="var(--muted)" /><YAxis domain={[0, 100]} stroke="var(--muted)" /><Tooltip contentStyle={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} /><Bar dataKey="score" radius={[8, 8, 0, 0]}>{cats.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer> : <p className="muted">No data yet.</p>}</div>
        <div className="card card-glow"><h3 style={{ marginTop: 0 }}>Recommended next steps</h3><ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>{(data.nextSteps || []).map((s, i) => <li key={i} className="muted">{s}</li>)}</ul><Link className="btn btn-primary" to="/app/upload">Upload another resume</Link></div>
      </div>
      <div className="card card-glow"><h3 style={{ marginTop: 0 }}>Recent analyses</h3>{!data.recentHistory?.length ? <p className="muted">Empty — your history will appear here.</p> : <ul style={{ paddingLeft: 18, lineHeight: 2 }}>{data.recentHistory.map((a) => <li key={a._id}><Link to={`/app/report/${a._id}`}>Score {a.overallScore}</Link> <span className="muted">· {new Date(a.createdAt).toLocaleString()}</span></li>)}</ul>}</div>
    </div>
  );
}
