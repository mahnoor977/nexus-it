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