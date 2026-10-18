import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('querylab-theme') || 'dark'; } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('querylab-theme', theme); } catch { /* private mode */ }
  }, [theme]);
  return <button className="icon-button" aria-label={theme === 'dark' ? 'Bật Light Mode' : 'Bật Dark Mode'} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
