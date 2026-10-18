import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const storageKey = 'querylab-theme'; // Preserve the choice saved by existing users.

function savedTheme() {
  try { return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(savedTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111827' : '#f8fafc');
    try { localStorage.setItem(storageKey, theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);
  function toggleTheme() { setTheme((current) => current === 'light' ? 'dark' : 'light'); }
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
