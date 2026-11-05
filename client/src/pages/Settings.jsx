import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, KeyRound, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast, errMsg } from '../context/ToastContext.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const nav = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [retain, setRetain] = useState(user?.preferences?.retainResumeText ?? true);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [confirm, setConfirm] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    try { const r = await api.patch('/api/auth/me', { name, preferences: { theme, retainResumeText: retain } }); setUser(r.data.data.user); success('Profile saved'); }
    catch (e) { error(errMsg(e)); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.post('/api/auth/change-password', pw); setPw({ currentPassword: '', newPassword: '' }); success('Password changed'); }
    catch (e) { error(errMsg(e)); }
  };
  const delAccount = async () => {
    try { await api.delete('/api/auth/account'); await logout(); nav('/'); }
    catch (e) { error(errMsg(e)); }
  };
  return (
    <div className="grid">
      <h2 style={{ margin: 0 }}>Settings</h2>
      <div className="card card-glow">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><UserCog size={20} /> Profile &amp; preferences</h3>
        <form onSubmit={save} className="grid">
          <label>Name<input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Theme<select className="select" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" checked={retain} onChange={(e) => setRetain(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--indigo)' }} /> Retain resume text (disable for max privacy; analysis requires re-upload)</label>
          <button className="btn btn-primary">Save</button>
        </form>
      </div>
      <div className="card card-glow">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}><KeyRound size={20} /> Change password</h3>
        <form onSubmit={changePw} className="grid grid-2">
          <input className="input" type="password" placeholder="Current" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
          <input className="input" type="password" placeholder="New (min 6)" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
          <button className="btn">Update password</button>
        </form>
      </div>
      <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)' }}><ShieldAlert size={20} /> Privacy &amp; data</h3>
        <p className="muted">Uploads are temp files deleted after extraction. Analyses store scores + skills per user. Delete account removes all resumes, analyses, and matches.</p>
        <button className="btn btn-danger" onClick={() => setConfirm(true)}>Delete account</button>
      </div>
      {confirm && <ConfirmDeleteModal title="Delete account?" message="Delete your account and ALL data?" onCancel={() => setConfirm(false)} onConfirm={delAccount} />}
    </div>
  );
}
