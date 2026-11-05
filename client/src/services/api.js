import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', timeout: 90000 });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('resumeiq_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('resumeiq_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default api;
