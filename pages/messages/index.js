import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import MobileMenu from '../../components/MobileMenu';

export default function Messages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      const myId = session.user.id;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const seen = new Map();
        data.forEach((m) => {
          const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
          const otherNickname = m.sender_id === myId ? m.receiver_nickname : m.sender_nickname;
          if (!seen.has(otherId)) {
            seen.set(otherId, {
              userId: otherId,
              nickname: otherNickname,
              lastMessage: m.content,
            });
          }
        });
        setConversations(Array.from(seen.values()));
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>Messages — NEXUS-IT</title>
      </Head>
      <div className="projects-page">
        <nav>
          <div className="logo">
            <MobileMenu links={[
              { label: 'Dashboard', onClick: () => router.push('/dashboard') },
              { label: 'Projects', onClick: () => router.push('/projects') },
              { label: 'Messages', onClick: () => router.push('/messages') },
              { label: 'Forum', onClick: () => router.push('/forum') },
              { label: 'Log out', onClick: handleLogout },
            ]} />
            <span>NEXUS-IT</span>
          </div>
          <div className="nav-links">
            <button className="btn" onClick={() => router.push('/dashboard')}>Dashboard</button>
          </div>
        </nav>

        <div className="projects-header">
          <h1>Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="projects-empty">
            No conversations yet — message someone from their project page to start one.
          </div>
        ) : (
          <div className="projects-list">
            {conversations.map((c) => (
              <div
                className="project-card project-card-link"
                key={c.userId}
                onClick={() => router.push(`/messages/${c.userId}?nickname=${encodeURIComponent(c.nickname)}`)}
              >
                <div className="project-card-top">
                  <h3>{c.nickname}</h3>
                </div>
                <p className="project-desc">{c.lastMessage}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}