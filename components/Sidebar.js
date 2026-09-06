import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ nickname }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

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
      <button className="sidebar-icon-btn sidebar-hamburger" onClick={() => setExpanded(!expanded)}>
        <i className="ti ti-menu-2"></i>
      </button>

      <div className="sidebar-logo" onClick={() => router.push('/dashboard')}>
        <i className="ti ti-hexagon"></i>
        {expanded && <span className="sidebar-label">NEXUS-IT</span>}
      </div>

      <button
        className={`sidebar-icon-btn ${router.pathname === '/search' ? 'active' : ''}`}
        onClick={() => router.push('/search')}
      >
        <i className="ti ti-search"></i>
        {expanded && <span className="sidebar-label">Search</span>}
      </button>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-icon-btn ${router.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            <i className={`ti ${item.icon}`}></i>
            {expanded && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <ThemeToggle expanded={expanded} />
        <button
          className={`sidebar-icon-btn ${router.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => router.push('/settings')}
        >
          <i className="ti ti-settings"></i>
          {expanded && <span className="sidebar-label">Settings</span>}
        </button>
        <button className="sidebar-avatar" onClick={() => router.push('/profile')}>
          {initials}
        </button>
        <button className="sidebar-icon-btn sidebar-logout" onClick={handleLogout}>
          <i className="ti ti-logout"></i>
          {expanded && <span className="sidebar-label">Log out</span>}
        </button>
      </div>
    </div>
  );
}