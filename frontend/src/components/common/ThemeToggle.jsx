import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" className="icon-button theme-toggle" aria-label={theme === 'dark' ? 'Bật Light Mode' : 'Bật Dark Mode'} title={theme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'} onClick={toggleTheme}>
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
