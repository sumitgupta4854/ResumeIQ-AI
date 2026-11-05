import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('resumeiq_token');
    if (!t) { setLoading(false); return; }
    api.get('/api/auth/me').then((r) => setUser(r.data.data.user)).catch(() => localStorage.removeItem('resumeiq_token')).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const r = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('resumeiq_token', r.data.data.token);
    setUser(r.data.data.user);
    return r.data.data.user;
  };
  const register = async (name, email, password, role) => {
    const r = await api.post('/api/auth/register', { name, email, password, role });
    localStorage.setItem('resumeiq_token', r.data.data.token);
    setUser(r.data.data.user);
  };
  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('resumeiq_token');
    setUser(null);
  };
  return <AuthCtx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}
