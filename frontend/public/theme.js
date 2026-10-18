// Apply the stored preference before paint; ThemeContext owns runtime state.
try {
  const theme = localStorage.getItem('querylab-theme') === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111827' : '#f8fafc');
} catch { document.documentElement.dataset.theme = 'light'; }
