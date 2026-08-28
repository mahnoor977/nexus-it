import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar({ nickname }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const initials = (nickname || '?').slice(0, 2).toUpperCase();

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => router.push('/dashboard')}>
        <i className="ti ti-hexagon"></i>
      </div>
            <button
        className={`sidebar-icon-btn ${router.pathname === '/search' ? 'active' : ''}`}
        onClick={() => router.push('/search')}
        title="Search"
      >
        <i className="ti ti-search"></i>
      </button>

      <div className="sidebar-nav">
        <button
          className={`sidebar-icon-btn ${router.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => router.push('/dashboard')}
          title="Feed"
        >
          <i className="ti ti-home"></i>
        </button>
                <button
          className={`sidebar-icon-btn ${router.pathname.startsWith('/posts') ? 'active' : ''}`}
          onClick={() => router.push('/posts')}
          title="Posts"
        >
          <i className="ti ti-news"></i>
        </button>
        <button
          className={`sidebar-icon-btn ${router.pathname === '/projects' ? 'active' : ''}`}
          onClick={() => router.push('/projects')}
          title="Projects"
        >
          <i className="ti ti-layout-grid"></i>
        </button>
        <button
          className="sidebar-icon-btn"
          onClick={() => router.push('/new-project')}
          title="New project"
        >
          <i className="ti ti-plus"></i>
        </button>
        <button
          className={`sidebar-icon-btn ${router.pathname === '/advisor' ? 'active' : ''}`}
          onClick={() => router.push('/advisor')}
          title="AI Advisor"
        >
          <i className="ti ti-sparkles"></i>
        </button>
        <button
          className={`sidebar-icon-btn ${router.pathname.startsWith('/messages') ? 'active' : ''}`}
          onClick={() => router.push('/messages')}
          title="Messages"
        >
          <i className="ti ti-message"></i>
        </button>
        <button
          className={`sidebar-icon-btn ${router.pathname.startsWith('/forum') ? 'active' : ''}`}
          onClick={() => router.push('/forum')}
          title="Forum"
        >
          <i className="ti ti-messages"></i>
        </button>
        <button
          className={`sidebar-icon-btn ${router.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => router.push('/profile')}
          title="Your profile"
        >
          <i className="ti ti-user"></i>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <button className="sidebar-icon-btn sidebar-logout" onClick={handleLogout} title="Log out">
          <i className="ti ti-logout"></i>
        </button>
      </div>
    </div>
  );
}