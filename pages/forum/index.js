import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import MobileMenu from '../../components/MobileMenu';

export default function Forum() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPosts(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <>
      <Head>
        <title>Forum — NEXUS-IT</title>
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
            <button className="btn btn-solid" onClick={() => router.push('/forum/new')}>+ New post</button>
          </div>
        </nav>

        <div className="projects-header">
          <h1>Forum</h1>
        </div>

        {loading && <div className="projects-empty">Loading posts…</div>}
        {error && <div className="projects-empty">Couldn't load posts: {error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="projects-empty">No discussions yet — start one.</div>
        )}

        {!loading && posts.length > 0 && (
          <div className="projects-list">
            {posts.map((p) => (
              <div
                className="project-card project-card-link"
                key={p.id}
                onClick={() => router.push(`/forum/${p.id}`)}
              >
                <div className="project-card-top">
                  <h3>{p.title}</h3>
                  <span className="project-author">by {p.author_nickname}</span>
                </div>
                <p className="project-desc">{p.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}