import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ nickname }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', expanded);
    return () => document.body.classList.remove('sidebar-expanded');
  }, [expanded]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const initials = (nickname || '?').slice(0, 2).toUpperCase();

  const navItems = [
    { path: '/projects', icon: 'ti-home', label: 'Home' },
    { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { path: '/posts', icon: 'ti-news', label: 'Posts' },
    { path: '/new-project', icon: 'ti-plus', label: 'New project' },
    { path: '/advisor', icon: 'ti-sparkles', label: 'Advisor' },
    { path: '/messages', icon: 'ti-message', label: 'Messages' },
    { path: '/forum', icon: 'ti-messages', label: 'Forum' },
  ];

  return (
    <div className={`sidebar ${expanded ? 'expanded' : ''}`}>
      <div className="sidebar-item-row" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <button className="sidebar-icon-btn">
          <i className="ti ti-menu-2"></i>
        </button>
      </div>

      <div className="sidebar-item-row" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-icon-btn"><i className="ti ti-hexagon"></i></div>
        {expanded && <span className="sidebar-label">NEXUS-IT</span>}
      </div>

      <div className="sidebar-item-row" onClick={() => router.push('/search')} style={{ cursor: 'pointer' }}>
        <button className={`sidebar-icon-btn ${router.pathname === '/search' ? 'active' : ''}`}>
          <i className="ti ti-search"></i>
        </button>
        {expanded && <span className="sidebar-label">Search</span>}
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className="sidebar-item-row"
            onClick={() => router.push(item.path)}
            style={{ cursor: 'pointer' }}
          >
            <button className={`sidebar-icon-btn ${router.pathname.startsWith(item.path) ? 'active' : ''}`}>
              <i className={`ti ${item.icon}`}></i>
            </button>
            {expanded && <span className="sidebar-label">{item.label}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item-row">
          <ThemeToggle expanded={expanded} />
        </div>

        <div className="sidebar-item-row" onClick={() => router.push('/settings')} style={{ cursor: 'pointer' }}>
          <button className="sidebar-icon-btn">
            <i className="ti ti-settings"></i>
          </button>
          {expanded && <span className="sidebar-label">Settings</span>}
        </div>

        <div className="sidebar-item-row" onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-avatar">{initials}</div>
          {expanded && <span className="sidebar-label">Profile</span>}
        </div>

        <div className="sidebar-item-row" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <button className="sidebar-icon-btn sidebar-logout">
            <i className="ti ti-logout"></i>
          </button>
          {expanded && <span className="sidebar-label">Log out</span>}
        </div>
      </div>
    </div>
  );
}