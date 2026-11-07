import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, LogIn, LogOut, Moon, Sun, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const goLogout = async () => { await logout(); nav('/'); };
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="ResumeIQ AI home">
          <span style={{ width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--grad-primary)', boxShadow: 'var(--glow)', color: '#fff', flex: '0 0 auto' }}>
            <BrainCircuit size={20} />
          </span>
          <span className="brand-text">ResumeIQ AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost nav-theme-button" onClick={toggle} aria-label="Toggle theme" style={{ padding: 10 }}>
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          {!user ? (
            <>
              <Link className="btn nav-action" to="/login" aria-label="Login"><LogIn size={15} /><span>Login</span></Link>
              <Link className="btn btn-primary nav-action" to="/register" aria-label="Get started"><UserPlus size={15} /><span>Get started</span></Link>
            </>
          ) : (
            <>
              <Link className="btn nav-action" to="/app"><LayoutDashboard size={15} /><span>Dashboard</span></Link>
              <button className="btn btn-ghost nav-action" onClick={goLogout}><LogOut size={15} /><span>Logout</span></button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
