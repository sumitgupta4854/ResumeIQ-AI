import { createContext, useContext, useEffect, useState } from 'react';
const ThemeCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('resumeiq_theme') || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('resumeiq_theme', theme);
  }, [theme]);
  return <ThemeCtx.Provider value={{ theme, setTheme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }}>{children}</ThemeCtx.Provider>;
}
