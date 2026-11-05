import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Briefcase, Wand2, History, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user } = useAuth();
  const links = [
    { to: '/app', icon: <LayoutDashboard size={17} />, label: 'Dashboard', end: true },
    { to: '/app/upload', icon: <Upload size={17} />, label: 'Upload Resume' },
    { to: '/app/candidates', icon: <Users size={17} />, label: 'Find Candidates' },
    { to: '/app/jobs', icon: <Briefcase size={17} />, label: 'Job Match' },
    { to: '/app/improve', icon: <Wand2 size={17} />, label: 'Improve' },
    { to: '/app/history', icon: <History size={17} />, label: 'History' },
    { to: '/app/settings', icon: <Settings size={17} />, label: 'Settings' }
  ];
  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          {l.icon}{l.label}
        </NavLink>
      ))}
      {user && (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 12px', borderRadius: 14, background: 'var(--card)', border: '1px solid var(--border)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--grad-cool)', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', flex: '0 0 auto' }}>{initial}</span>
          <span style={{ overflow: 'hidden' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
            <span className="muted" style={{ fontSize: 12 }}>{user.email}</span>
          </span>
        </div>
      )}
    </aside>
  );
}
