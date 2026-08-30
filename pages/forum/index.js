import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function Forum() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setNickname(session.user.user_metadata?.nickname || session.user.email);
      }

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

  return (
    <>
      <Head>
        <title>Forum — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="page-shell wide">
            <div className="projects-header" style={{ margin: '0 0 40px' }}>
              <h1>Forum</h1>
              <button className="btn btn-solid" onClick={() => router.push('/forum/new')}>+ New post</button>
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
                      <span
                        className="project-author"
                        onClick={(e) => { e.stopPropagation(); router.push(`/user/${p.user_id}`); }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        by {p.author_nickname}
                      </span>
                    </div>
                    <p className="project-desc">{p.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}