# NEXUS-IT — UI Redesign Implementation Plan

Baseline: branch `main` at commit `a9b1a2d` ("add logo and topbar and enhance the responsiveness").
Execute the steps in order. All changes are frontend-only; no database or API changes.

Summary of what this plan delivers:
1. A global top navbar on every authenticated page (search, quick-post, notifications, profile menu).
2. The dedicated `/search` page removed; search merged into the home page (`/projects`).
3. One uniform page layout: identical heading style and identical content spacing on every page.
4. Sidebar rework: logo owns the top corner (divider aligned with the navbar border), expanded by default on desktop, fixed active-item state, wider collapsed mode, and a small edge-riding collapse toggle in the lower section.

---

## Step 1 — Create `components/Navbar.js` (new file)

Full file contents:

```jsx
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const PAGE_TITLES = [
  { prefix: '/projects', title: 'Home' },
  { prefix: '/dashboard', title: 'Dashboard' },
  { prefix: '/posts', title: 'Posts' },
  { prefix: '/new-project', title: 'New project' },
  { prefix: '/advisor', title: 'AI Advisor' },
  { prefix: '/messages', title: 'Messages' },
  { prefix: '/forum', title: 'Community' },
  { prefix: '/tech-stack', title: 'Tech Stack' },
  { prefix: '/resources', title: 'Resources' },
  { prefix: '/docs', title: 'Docs' },
  { prefix: '/profile', title: 'Settings' },
  { prefix: '/project/', title: 'Project' },
  { prefix: '/user/', title: 'Profile' },
];

export default function Navbar({ nickname }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [conversations, setConversations] = useState([]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const initials = (nickname || 'B').slice(0, 2).toUpperCase();
  const pageTitle =
    PAGE_TITLES.find((p) => router.pathname.startsWith(p.prefix) || router.asPath.startsWith(p.prefix))?.title || '';

  useEffect(() => {
    async function loadConversations() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const myId = session.user.id;

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        const seen = new Map();
        data.forEach((m) => {
          const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
          const otherNickname = m.sender_id === myId ? m.receiver_nickname : m.sender_nickname;
          if (!seen.has(otherId)) {
            seen.set(otherId, {
              userId: otherId,
              nickname: otherNickname || 'Builder',
              lastMessage: m.content,
            });
          }
        });
        setConversations(Array.from(seen.values()).slice(0, 8));
      }
    }
    loadConversations();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    function handleShortcut(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/projects?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
    searchInputRef.current?.blur();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        {pageTitle && <span className="navbar-page-title">{pageTitle}</span>}
      </div>

      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <i className="ti ti-search"></i>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search projects, people, tech..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="navbar-kbd">⌘K</span>
      </form>

      <div className="navbar-actions">
        <button
          className="navbar-icon-btn"
          onClick={() => router.push('/new-project')}
          title="Post a project"
          aria-label="Post a project"
        >
          <i className="ti ti-plus"></i>
        </button>

        <div ref={notifRef} className="navbar-item">
          <button
            className="navbar-icon-btn"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            aria-label="Notifications"
          >
            <i className="ti ti-bell"></i>
            {conversations.length > 0 && <span className="navbar-dot" />}
          </button>

          {showNotifications && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-head">Conversations</div>
              {conversations.length === 0 ? (
                <div className="navbar-dropdown-empty">Nothing here yet.</div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.userId}
                    className="navbar-dropdown-row"
                    onClick={() => {
                      setShowNotifications(false);
                      router.push(`/messages/${c.userId}?nickname=${encodeURIComponent(c.nickname)}`);
                    }}
                  >
                    <div className="navbar-row-avatar">{(c.nickname || 'B').slice(0, 2).toUpperCase()}</div>
                    <div className="navbar-row-text">
                      <div className="navbar-row-name">{c.nickname}</div>
                      <div className="navbar-row-sub">{c.lastMessage}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div ref={profileRef} className="navbar-item">
          <button
            className="navbar-profile-trigger"
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            aria-label="Account menu"
          >
            <span className="navbar-avatar">{initials}</span>
            <span className="navbar-profile-name">{nickname || 'Builder'}</span>
            <i className="ti ti-chevron-down"></i>
          </button>

          {showProfileMenu && (
            <div className="navbar-dropdown navbar-dropdown-menu">
              <div className="navbar-dropdown-head">{nickname || 'Builder'}</div>
              <button className="navbar-menu-item" onClick={() => { setShowProfileMenu(false); router.push('/dashboard'); }}>
                <i className="ti ti-layout-dashboard"></i> Dashboard
              </button>
              <button className="navbar-menu-item" onClick={() => { setShowProfileMenu(false); router.push('/profile'); }}>
                <i className="ti ti-user"></i> Profile & settings
              </button>
              <button className="navbar-menu-item danger" onClick={handleLogout}>
                <i className="ti ti-logout"></i> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

## Step 2 — Create `components/AppLayout.js` (new file)

Full file contents:

```jsx
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Shared shell for all authenticated pages: sidebar + navbar + uniformly
// padded content area (.page-content controls heading spacing everywhere).
export default function AppLayout({ nickname, children }) {
  return (
    <>
      <Sidebar nickname={nickname} />
      <div className="app-main">
        <Navbar nickname={nickname} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
```

---

## Step 3 — Rewrite `components/Sidebar.js`

Replace the whole file with the version below. Behavioral changes vs baseline:
- Logo/brand row is the FIRST element in the sidebar header (`sidebar-top-controls`), clicking it goes to `/projects`. The old top toggle row is removed.
- The standalone "Search" row is removed (search now lives in the navbar/home page).
- The footer "Profile" avatar row is removed (profile access moved to the navbar). Footer keeps: Theme, Settings, Log out.
- Sidebar is expanded by default on desktop; on mobile it stays a closed drawer.
- Auto-collapse on route change happens on mobile only (desktop keeps state across navigation).
- A small round toggle button (`sidebar-edge-btn`) straddles the sidebar's right border in the lower section and glides with expand/collapse.
- The mobile topbar search button navigates to `/projects` (the `/search` page no longer exists).

```jsx
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
          <img src="/logo.png" alt="NEXUS-IT" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
              <img src="/logo.png" alt="NEXUS-IT" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
          <div className="sidebar-item-row">
            <ThemeToggle expanded={expanded} />
          </div>

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

      {/* Toggle straddling the sidebar edge, lower section */}
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
```

---

## Step 4 — Convert every authenticated page to `AppLayout`

Apply to ALL of these pages:
`pages/projects.js`, `pages/dashboard.js`, `pages/new-project.js`, `pages/advisor.js`, `pages/profile.js`, `pages/messages/index.js`, `pages/messages/[userId].js`, `pages/forum/index.js`, `pages/forum/[id].js`, `pages/forum/new.js`, `pages/posts/index.js`, `pages/project/[id].js`, `pages/user/[id].js`, `pages/tech-stack.js`, `pages/resources.js`, `pages/docs.js`

Rules per page:
1. Replace `import Sidebar from '.../components/Sidebar'` with `import AppLayout from '.../components/AppLayout'` (adjust relative path depth). Delete any `import Topbar ...` line — the old `Topbar` component is no longer used anywhere.
2. Replace the opening shell markup with `<AppLayout nickname={<nicknameVar>}>`. Two shapes exist in the baseline:
   - Shape A: `<Sidebar nickname={X} />` followed by `<div className="app-main">` → replace both with `<AppLayout nickname={X}>`.
   - Shape B: `<div className="app-shell"><Sidebar nickname={X} /><div className="app-main">` (sometimes followed by `<Topbar .../>`) → replace all of it with `<AppLayout nickname={X}>` (delete the `<Topbar/>` line too).
3. Fix the closing tags at the end of the JSX to match: the `</div>` that closed `.app-main` (and the extra `</div>` for `.app-shell` in shape B) become a single `</AppLayout>`.
4. Remove hardcoded page padding from the inner content wrapper: `style={{ padding: '36px 48px', maxWidth: 'NNNpx' }}` becomes `style={{ maxWidth: 'NNNpx' }}` (keep each page's own maxWidth). In `pages/advisor.js`, also remove its `padding: '40px 24px 100px'`. Spacing now comes exclusively from the `.page-content` class inside AppLayout.
5. Pages that used the Rules-of-Hooks-violating early return (`if (authLoading) return ...` placed before other hooks) must keep the early return AFTER all hook calls.

---

## Step 5 — Merge search into the home page (`pages/projects.js`)

1. Add people-search state and two effects (place with the other hooks at the top of the component):

```jsx
const [peopleResults, setPeopleResults] = useState([]);

// Seed search from navbar (/projects?q=...)
useEffect(() => {
  if (typeof router.query.q === 'string') setSearchQuery(router.query.q);
}, [router.query.q]);

// People search (debounced) alongside the project filter
useEffect(() => {
  const trimmed = searchQuery.trim();
  if (!trimmed) {
    setPeopleResults([]);
    return;
  }
  const timeout = setTimeout(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`nickname.ilike.%${trimmed}%,bio.ilike.%${trimmed}%,skills.ilike.%${trimmed}%`)
      .limit(6);
    setPeopleResults(data || []);
  }, 350);
  return () => clearTimeout(timeout);
}, [searchQuery]);
```

2. Render a "People" results section directly after the error block and before the loading/empty/grid blocks:

```jsx
{searchQuery.trim() && peopleResults.length > 0 && (
  <div className="people-results">
    <h3>People</h3>
    {peopleResults.map((p) => (
      <div
        key={p.id}
        className="people-result-row"
        onClick={() => router.push(`/user/${p.id}`)}
      >
        <div className="people-result-avatar">
          {(p.nickname || 'B').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="people-result-name">{p.nickname}</div>
          {p.bio && <div className="people-result-bio">{p.bio.slice(0, 80)}</div>}
        </div>
      </div>
    ))}
  </div>
)}
```

3. In the page's own search box, remove the decorative `⌘K` `<span>` chip (the shortcut now belongs to the navbar search).

## Step 6 — Delete `pages/search.js`

Remove the file entirely. `/search` should 404. (Sidebar/mobile references were already repointed in Step 3.)

---

## Step 7 — Unify page headings

In these files, replace every page-heading `<h1 style={{ ... }}>` (any inline style object) with `<h1 className="page-title">`:
`pages/advisor.js`, `pages/dashboard.js`, `pages/new-project.js`, `pages/projects.js`, `pages/tech-stack.js`, `pages/profile.js`, `pages/forum/[id].js`, `pages/forum/index.js`, `pages/forum/new.js`, `pages/messages/index.js`, `pages/posts/index.js`, `pages/resources.js`

Do NOT touch `pages/index.js` (landing), `pages/privacy.js`, `pages/terms.js`, or bare `<h1>` tags without inline styles.

---

## Step 8 — Append CSS to `styles/globals.css`

Append the following block at the end of the file. These are final values (they intentionally override some earlier rules in the file, e.g. the old `.sidebar-icon-btn.active` gold-on-gold state and the 72px sidebar width).

```css
/* ==========================================================================
   GLOBAL NAVBAR + UNIFIED PAGE LAYOUT + SIDEBAR REWORK
   ========================================================================== */

/* ---------- Navbar ---------- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 40px;
  height: 64px;                 /* fixed: aligns with the sidebar header divider */
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
}

.navbar-left { flex: 0 0 auto; min-width: 110px; }

.navbar-page-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tea);
  white-space: nowrap;
}

.navbar-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 420px;
  background: var(--panel-2);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 9px 14px;
}
.navbar-search:focus-within { border-color: var(--tea); }
.navbar-search i { color: var(--muted); font-size: 15px; }
.navbar-search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
}

.navbar-kbd {
  font-size: 11px;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: 'IBM Plex Mono', monospace;
  flex-shrink: 0;
}

.navbar-actions { display: flex; align-items: center; gap: 14px; }
.navbar-item { position: relative; }

.navbar-icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--text);
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.navbar-icon-btn:hover { border-color: var(--tea); color: var(--tea); }

.navbar-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tea);
}

.navbar-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--tea);
  color: #1A1A1A;
  font-weight: 600;
  font-size: 11px;
  font-family: 'IBM Plex Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.navbar-profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 10px 3px 3px;
  cursor: pointer;
  color: var(--muted);
}
.navbar-profile-trigger:hover { border-color: var(--tea); }
.navbar-profile-trigger i { font-size: 14px; }

.navbar-profile-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 300px;
  max-height: 380px;
  overflow-y: auto;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 200;
}
.navbar-dropdown-menu { width: 220px; padding-bottom: 6px; }

.navbar-dropdown-head {
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.navbar-dropdown-empty { padding: 18px 16px; font-size: 13.5px; color: var(--muted); }

.navbar-dropdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--panel-2);
}
.navbar-dropdown-row:hover { background: var(--panel-2); }

.navbar-row-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--tea);
  color: #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.navbar-row-text { min-width: 0; }
.navbar-row-name { font-size: 13.5px; font-weight: 500; color: var(--text); }
.navbar-row-sub {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navbar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}
.navbar-menu-item i { font-size: 16px; color: var(--muted); }
.navbar-menu-item:hover { background: var(--panel-2); }
.navbar-menu-item.danger { color: #c0392b; }
.navbar-menu-item.danger i { color: #c0392b; }

/* ---------- Uniform content spacing + headings ---------- */
.page-content { padding: 44px 56px; }

.page-title,
.page-content h1 {
  font-family: 'Newsreader', serif !important;
  font-weight: 600 !important;
  font-size: clamp(30px, 3vw, 38px) !important;
  line-height: 1.2 !important;
  color: var(--text) !important;
  margin: 0 0 10px 0 !important;
}

/* ---------- Home page people results ---------- */
.people-results { margin-bottom: 32px; }
.people-results h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: 'IBM Plex Sans', sans-serif;
}
.people-result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 18px;
  cursor: pointer;
  margin-bottom: 10px;
}
.people-result-row:hover { border-color: var(--tea); }
.people-result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--tea);
  color: #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}
.people-result-name { font-weight: 500; color: var(--text); }
.people-result-bio { font-size: 13px; color: var(--muted); }

/* ---------- Sidebar rework (desktop) ---------- */
.sidebar-edge-btn { display: none; }

@media (min-width: 769px) {
  /* Header band: 64px, divider aligned with the navbar bottom border */
  .sidebar {
    padding-top: 0 !important;
    width: 88px;               /* wider collapsed mode (was 72px) */
  }

  .sidebar-top-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 64px;
    margin-bottom: 10px;
    padding-bottom: 0;
    border-bottom: 1px solid #2A2A2A;
    flex-shrink: 0;
  }

  .brand-row:hover { background: transparent; }
  .brand-logo-btn { width: 36px !important; height: 36px !important; }
  .brand-logo-btn img { width: 28px !important; height: 28px !important; }

  .brand-name-label {
    font-weight: 700;
    font-size: 14px !important;
    letter-spacing: 0.04em;
    color: #C5A059 !important;
  }

  /* Bigger rows/icons in collapsed mode (no scrollbar) */
  .sidebar-item-row { padding: 9px 12px; justify-content: flex-start; }
  .sidebar-icon-btn { width: 34px; height: 34px; font-size: 21px; }
  .sidebar-nav { gap: 3px; }
  .sidebar-footer { padding-top: 10px; }

  .sidebar.expanded { width: 240px !important; }

  .app-main { margin-left: 88px; width: calc(100% - 88px); }
  body.sidebar-expanded .app-main { margin-left: 240px; width: calc(100% - 240px); }

  /* Active item: soft gold tint + gold left bar; icon stays visible
     (fixes the old gold-on-gold state that hid the icon) */
  .sidebar-icon-btn.active {
    background: transparent !important;
    color: #C5A059 !important;
  }
  .sidebar-item-row.item-active {
    position: relative;
    background: rgba(197, 160, 89, 0.14) !important;
  }
  .sidebar-item-row.item-active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 999px;
    background: #C5A059;
  }
  .sidebar.expanded .sidebar-item-row.item-active::before { left: -14px; }
  .sidebar-item-row.item-active .sidebar-label {
    color: #C5A059;
    font-weight: 600;
  }

  /* Edge toggle: 22px circle straddling the sidebar border, lower section.
     Glides with the sidebar width. */
  .sidebar-edge-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 90px;
    left: 77px;                /* 88px sidebar - half of 22px button */
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid #3D3627;
    background: #211D16;
    color: rgba(250, 248, 245, 0.65);
    font-size: 12px;
    cursor: pointer;
    z-index: 170;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s, border-color 0.15s;
  }
  .sidebar-edge-btn:hover { color: #C5A059; border-color: #C5A059; }
  body.sidebar-expanded .sidebar-edge-btn { left: 229px; }  /* 240px - 11px */
}

/* ---------- Mobile (<= 768px) ---------- */
@media (max-width: 768px) {
  .navbar { display: none !important; }   /* mobile-topbar takes over */
  .page-content { padding: 22px 16px; }
}

@media (max-width: 1024px) {
  .navbar-left { display: none; }
  .navbar-profile-name { display: none; }
}
```

---

## Step 9 (optional, dev-only) — Mock Supabase client for UI work without env vars

Only needed to run the UI locally with no `.env.local`. Skip in production. In `lib/supabaseClient.js`, keep the real `createClient(supabaseUrl, supabaseAnonKey)` when both env vars exist, and otherwise export a mock with the same surface: `auth.getSession` returns a fake session (`user.id: 'local-dev-user'`, `user_metadata.nickname: 'LocalDev'`), `auth.onAuthStateChange` returns a no-op subscription, all other `auth.*` methods resolve with `{ error: { message: 'Local UI mode — no database connected.' } }`, `from()` returns a chainable thenable builder (`select/insert/update/delete/eq/or/in/order/limit/single` all return `this`; awaiting resolves `{ data: [], error: null }`, or `{ data: null, error: null }` after `.single()`), and `storage.from()` returns `{ upload: async () => ({ error: {...} }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }`.

---

## Verification checklist

1. `npm run dev` — every route below returns 200 and renders with sidebar + navbar:
   `/projects`, `/dashboard`, `/posts`, `/new-project`, `/advisor`, `/messages`, `/forum`, `/forum/new`, `/tech-stack`, `/resources`, `/docs`, `/profile`.
2. `/search` returns 404.
3. Desktop: sidebar starts EXPANDED; the divider under the logo lines up exactly with the navbar's bottom border; the small round chevron sits on the sidebar edge ~90px from the bottom and glides when toggling; active nav item shows gold tint + left bar with the icon clearly visible.
4. Navbar: ⌘K / Ctrl+K focuses search; submitting navigates to `/projects?q=...` and the home page shows matching People + filtered projects; bell shows recent conversations; avatar pill opens Dashboard / Profile & settings / Log out.
5. Every page heading has identical font, size, color, and identical distance from the sidebar and navbar.
6. Mobile (≤768px): desktop navbar hidden, mobile topbar + drawer still work, drawer closes on navigation.
