import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ nickname }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true); // start expanded for better UX

  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', expanded);
    return () => document.body.classList.remove('sidebar-expanded');
  }, [expanded]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const initials = (nickname || 'B').slice(0, 2).toUpperCase();

  const navItems = [
    { path: '/advisor', icon: 'ti-sparkles', label: 'AI Advisor' },
    { path: '/projects', icon: 'ti-folder', label: 'Projects' },
    { path: '/posts', icon: 'ti-news', label: 'Posts' },
    { path: '/new-project', icon: 'ti-plus', label: 'Create' },
    { path: '/messages', icon: 'ti-message', label: 'Messages' },
    { path: '/forum', icon: 'ti-messages', label: 'Forum' },
    { path: '/search', icon: 'ti-search', label: 'Search' },
  ];

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
      {/* Logo + Brand */}
      <div className="sidebar-brand" onClick={() => router.push('/projects')}>
        <div className="logo-mark">
          {/* Geometric N mark */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 8L16 4L26 8V24L16 28L6 24V8Z"
              stroke="#D4AF37"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M16 4V28M6 8L26 24M26 8L6 24"
              stroke="#D4AF37"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {expanded && (
          <div className="brand-text">
            <div className="brand-name">NEXUS-IT</div>
            <div className="brand-sub">BUILDERS PLATFORM</div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-label="Toggle sidebar"
      >
        <i className={`ti ${expanded ? 'ti-layout-sidebar-left-collapse' : 'ti-layout-sidebar-left-expand'}`}></i>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = router.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              <i className={`ti ${item.icon}`}></i>
              {expanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => router.push('/profile')}>
          <div className="user-avatar">{initials}</div>
          {expanded && (
            <div className="user-info">
              <div className="user-name">{nickname || 'Builder'}</div>
              <div className="user-role">Level 4 Architect</div>
            </div>
          )}
        </button>

        <button className="nav-item" onClick={() => router.push('/settings')}>
          <i className="ti ti-settings"></i>
          {expanded && <span>Settings</span>}
        </button>

        <button className="nav-item logout" onClick={handleLogout}>
          <i className="ti ti-logout"></i>
          {expanded && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}