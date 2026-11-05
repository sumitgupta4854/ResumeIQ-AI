import { createContext, useContext, useState, useCallback } from 'react';
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);
let idc = 1;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'info') => {
    const id = idc++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push, success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (<div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>))}
      </div>
    </ToastCtx.Provider>
  );
}
export function errMsg(e, fallback = 'Something went wrong') {
  return e?.response?.data?.error?.message || e?.response?.data?.detail || e?.message || fallback;
}
