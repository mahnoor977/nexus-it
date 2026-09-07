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
        setNickname(session.user.user_metadata?.nickname || 'Builder');
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Forum · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '900px' }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '36px'
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '36px',
                color: '#1A1A1A',
                margin: '0 0 6px 0'
              }}>
                Forum
              </h1>
              <p style={{ color: '#6B6558', fontSize: '15px', margin: 0 }}>
                Discussions, questions, and ideas from the community
              </p>
            </div>

            <button
              onClick={() => router.push('/forum/new')}
              style={{
                background: '#C5A059',
                color: '#1A1A1A',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + New post
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ color: '#6B6558', padding: '40px 0' }}>
              Loading discussions…
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ color: '#c0392b', marginBottom: '20px' }}>
              Couldn’t load posts: {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: '16px',
              padding: '64px 40px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '42px', color: '#C5A059', marginBottom: '20px' }}>
                <i className="ti ti-messages"></i>
              </div>
              <h3 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '24px',
                color: '#1A1A1A',
                marginBottom: '10px'
              }}>
                No discussions yet
              </h3>
              <p style={{
                color: '#6B6558',
                fontSize: '15px',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '360px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Be the first to start a conversation with the community.
              </p>
              <button
                onClick={() => router.push('/forum/new')}
                style={{
                  background: '#C5A059',
                  color: '#1A1A1A',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + Start a discussion
              </button>
            </div>
          )}

          {/* Posts List */}
          {!loading && posts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/forum/${p.id}`)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E0D8',
                    borderRadius: '14px',
                    padding: '22px 26px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,0,0,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '10px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      margin: 0,
                      lineHeight: 1.3
                    }}>
                      {p.title}
                    </h3>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/user/${p.user_id}`);
                      }}
                      style={{
                        color: '#C5A059',
                        fontSize: '13px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      by {p.author_nickname || 'Builder'}
                    </span>
                  </div>

                  <p style={{
                    color: '#6B6558',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {p.body?.slice(0, 180)}{p.body?.length > 180 ? '…' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}