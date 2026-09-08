import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ nickname }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    // Update main content margin when sidebar expands/collapses
    const main = document.querySelector('.app-main');
    if (main) {
      main.style.marginLeft = expanded ? '240px' : '72px';
    }
  }, [expanded]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const initials = (nickname || 'MA').slice(0, 2).toUpperCase();

  const navItems = [
    { path: '/projects', icon: '📁', label: 'Projects' },
    { path: '/posts', icon: '📰', label: 'Posts' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/forum', icon: '💭', label: 'Forum' },
    { path: '/search', icon: '🔍', label: 'Search' },
    { path: '/advisor', icon: '✨', label: 'AI Advisor' },
    { path: '/new-project', icon: '➕', label: 'Create' },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: expanded ? '240px' : '72px',
        height: '100vh',
        background: '#1A1A1A',
        color: '#F5F0E8',
        display: 'flex',
        flexDirection: 'column',
        padding: expanded ? '24px 16px' : '24px 12px',
        zIndex: 50,
        borderRight: '1px solid #2A2A2A',
        transition: 'width 0.25s ease, padding 0.25s ease',
        overflow: 'hidden',
      }}
    >
      {/* Brand + Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          marginBottom: '28px',
        }}
      >
        <div
          onClick={() => router.push('/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#C5A059',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1A1A1A',
              fontWeight: 700,
              fontSize: '16px',
              flexShrink: 0,
            }}
          >
            N
          </div>
          {expanded && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#FDFBF7' }}>NEXUS-IT</div>
              <div style={{ fontSize: '10px', color: '#C5A059', letterSpacing: '0.08em' }}>
                BUILDERS PLATFORM
              </div>
            </div>
          )}
        </div>

        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9C9482',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
            }}
            title="Collapse sidebar"
          >
            ←
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9C9482',
            cursor: 'pointer',
            fontSize: '18px',
            marginBottom: '20px',
            width: '100%',
            textAlign: 'center',
          }}
          title="Expand sidebar"
        >
          →
        </button>
      )}

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = router.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              title={!expanded ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: expanded ? '11px 14px' : '11px 0',
                justifyContent: expanded ? 'flex-start' : 'center',
                border: 'none',
                borderRadius: '10px',
                background: isActive ? '#C5A059' : 'transparent',
                color: isActive ? '#1A1A1A' : '#B8B0A0',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {expanded && item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
        <div
          onClick={() => router.push('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            cursor: 'pointer',
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#C5A059',
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          {expanded && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#FDFBF7' }}>
                {nickname || 'Builder'}
              </div>
              <div style={{ fontSize: '11px', color: '#9C9482' }}>Level 4 Architect</div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: expanded ? '10px 14px' : '10px 0',
            border: 'none',
            borderRadius: '8px',
            background: 'transparent',
            color: '#E57373',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: expanded ? 'left' : 'center',
          }}
        >
          {expanded ? 'Log out' : '🚪'}
        </button>
      </div>
    </aside>
  );
}