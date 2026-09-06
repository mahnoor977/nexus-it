import { useEffect, useState } from 'react';

export default function ThemeToggle({ expanded }) {
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
    <>
      <button className="sidebar-icon-btn" onClick={toggleTheme} title="Toggle theme">
        <i className={`ti ${theme === 'light' ? 'ti-moon-stars' : 'ti-sun'}`}></i>
      </button>
      {expanded && <span className="sidebar-label">Theme</span>}
    </>
  );
}