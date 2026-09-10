import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ nickname = 'Builder' }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const main = document.querySelector('.app-main');
    if (main) {
      main.style.marginLeft = expanded ? '240px' : '72px';
    }
  }, [expanded]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const initials = (nickname || 'B').slice(0, 2).toUpperCase();

  const navItems = [
    { path: '/projects', label: 'Projects' },
    { path: '/posts', label: 'Posts' },
    { path: '/messages', label: 'Messages' },
    { path: '/forum', label: 'Forum' },
    { path: '/search', label: 'Search' },
    { path: '/advisor', label: 'AI Advisor' },
    { path: '/new-project', label: 'Create' },
    { path: '/dashboard', label: 'Dashboard' },
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
        padding: '20px 12px',
        zIndex: 50,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div
          onClick={() => router.push('/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#C5A059',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1A1A1A',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            N
          </div>
          {expanded && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>NEXUS-IT</div>
              <div style={{ fontSize: '10px', color: '#C5A059' }}>BUILDERS PLATFORM</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#C5A059',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const active = router.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: active ? '#C5A059' : 'transparent',
                color: active ? '#1A1A1A' : '#B8B0A0',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {expanded ? item.label : item.label.charAt(0)}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '12px' }}>
        <div
          onClick={() => router.push('/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#C5A059',
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
          {expanded && (
            <div>
              <div style={{ fontSize: '13px' }}>{nickname}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Level 4 Architect</div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#E57373',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '6px 0',
          }}
        >
          {expanded ? 'Log out' : '×'}
        </button>
      </div>
    </aside>
  );
}