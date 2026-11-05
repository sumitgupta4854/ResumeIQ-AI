import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (<button className="btn" onClick={toggle} aria-label="Toggle theme">{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</button>);
}
