import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nexus-theme', next);
  }

  return (
    <div
      className="sidebar-item-row"
      onClick={toggleTheme}
      style={{ cursor: 'pointer' }}
      title="Toggle theme"
    >
      <button className="sidebar-icon-btn" tabIndex={-1}>
        <i className={`ti ${theme === 'light' ? 'ti-moon-stars' : 'ti-sun'}`}></i>
      </button>
      <span className="sidebar-label">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </div>
  );
}
