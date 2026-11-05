import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast, errMsg } from '../context/ToastContext.jsx';

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container section" style={{ maxWidth: 480 }}>
      <div className="card card-glow" style={{ padding: 30 }}>
        <span className="eyebrow"><Sparkles size={15} /> ResumeIQ AI</span>
        <h2 style={{ margin: '0 0 6px' }}>{title}</h2>
        <p className="muted" style={{ marginTop: 0 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const { error, success } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await login(form.email, form.password); success('Welcome back!'); nav('/app'); }
    catch (e) { error(errMsg(e, 'Login failed')); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Login" subtitle="Welcome back — pick up where you left off.">
      <form onSubmit={submit} className="grid">
        <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      </form>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const { error, success } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await register(form.name, form.email, form.password); success('Account created!'); nav('/app'); }
    catch (e) { error(errMsg(e, 'Registration failed')); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Create account" subtitle="One account for resume analysis and candidate search.">
      <form onSubmit={submit} className="grid">
        <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password (min 6)" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
      </form>
      <p className="muted">Have an account? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}
