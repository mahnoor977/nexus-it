import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ nickname }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

  // Expanded by default on desktop; collapsed drawer on mobile
  useEffect(() => {
    if (!isMobile()) setExpanded(true);
  }, []);

  // Navbar hamburger toggles the sidebar
  useEffect(() => {
    const handleToggle = () => setExpanded((v) => !v);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  // Close the drawer on route changes (mobile only)
  useEffect(() => {
    const handleRouteChange = () => { if (isMobile()) setExpanded(false); };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-expanded', expanded);
    return () => document.body.classList.remove('sidebar-expanded');
  }, [expanded]);

  async function handleLogout() {
    if (isMobile()) setExpanded(false);
    await supabase.auth.signOut();
    router.replace('/');
  }

  function handleNav(path) {
    if (isMobile()) setExpanded(false);
    router.push(path);
  }

  const initials = (nickname || '?').slice(0, 2).toUpperCase();

  const navItems = [
    { path: '/projects', icon: 'ti-home', label: 'Home' },
    { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { path: '/posts', icon: 'ti-news', label: 'Posts' },
    { path: '/new-project', icon: 'ti-plus', label: 'New project' },
    { path: '/advisor', icon: 'ti-sparkles', label: 'Advisor' },
    { path: '/messages', icon: 'ti-message', label: 'Messages' },
    { path: '/forum', icon: 'ti-messages', label: 'Community' },
    { path: '/tech-stack', icon: 'ti-stack-2', label: 'Tech Stack' },
    { path: '/resources', icon: 'ti-books', label: 'Resources' },
    { path: '/docs', icon: 'ti-file-text', label: 'Docs' },
  ];

  return (
    <>
      {/* Mobile Top Header (visible on mobile <= 768px via CSS) */}
      <header className="mobile-topbar">
        <button
          className="mobile-topbar-btn"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle navigation menu"
        >
          <i className={`ti ${expanded ? 'ti-x' : 'ti-menu-2'}`}></i>
        </button>

        <div className="mobile-topbar-brand" onClick={() => handleNav('/projects')}>
          <img src="/logo.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span>NEXUS-IT</span>
        </div>

        <div className="mobile-topbar-actions">
          <button
            className="mobile-topbar-search-btn"
            onClick={() => handleNav('/projects')}
            aria-label="Search"
          >
            <i className="ti ti-search"></i>
          </button>
          <div
            className="mobile-topbar-avatar"
            onClick={() => handleNav('/profile')}
            title="Profile"
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Dimmed backdrop when mobile drawer is open */}
      <div
        className={`sidebar-backdrop ${expanded ? 'active' : ''}`}
        onClick={() => setExpanded(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar / Mobile Drawer */}
      <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
        <div className="sidebar-top-controls">
          <div
            className="sidebar-item-row brand-row"
            onClick={() => handleNav('/projects')}
            style={{ cursor: 'pointer' }}
            title="NEXUS-IT"
          >
            <div className="sidebar-icon-btn brand-logo-btn">
              <img src="/logo.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </div>
            <span className="sidebar-label brand-name-label">NEXUS-IT</span>
          </div>

          <button
            className="mobile-drawer-close-btn"
            onClick={() => setExpanded(false)}
            aria-label="Close menu"
          >
            <i className="ti ti-x"></i>
          </button>

        </div>

        <div className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`sidebar-item-row ${router.pathname.startsWith(item.path) ? 'item-active' : ''}`}
              onClick={() => handleNav(item.path)}
              style={{ cursor: 'pointer' }}
            >
              <button className={`sidebar-icon-btn ${router.pathname.startsWith(item.path) ? 'active' : ''}`}>
                <i className={`ti ${item.icon}`}></i>
              </button>
              <span className="sidebar-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <ThemeToggle />

          <div className="sidebar-item-row" onClick={() => handleNav('/profile')} style={{ cursor: 'pointer' }}>
            <button className="sidebar-icon-btn">
              <i className="ti ti-settings"></i>
            </button>
            <span className="sidebar-label">Settings</span>
          </div>

          <div className="sidebar-item-row" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <button className="sidebar-icon-btn sidebar-logout">
              <i className="ti ti-logout"></i>
            </button>
            <span className="sidebar-label">Log out</span>
          </div>
        </div>
      </aside>

      {/* Toggle straddling the sidebar edge, level with the header */}
      <button
        className="sidebar-edge-btn"
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={expanded ? 'Collapse' : 'Expand'}
      >
        <i className={`ti ${expanded ? 'ti-chevron-left' : 'ti-chevron-right'}`}></i>
      </button>
    </>
  );
}