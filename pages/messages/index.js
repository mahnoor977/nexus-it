import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function Messages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }

      const myId = session.user.id;
      setNickname(session.user.user_metadata?.nickname || 'Builder');

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
              nickname: otherNickname || 'Builder',
              lastMessage: m.content,
              createdAt: m.created_at,
            });
          }
        });
        setConversations(Array.from(seen.values()));
      }

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFBF7',
        color: '#6B6558'
      }}>
        Loading messages…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '800px' }}>

          {/* Header */}
          <h1 style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '36px',
            color: '#1A1A1A',
            marginBottom: '8px'
          }}>
            Messages
          </h1>
          <p style={{ color: '#6B6558', marginBottom: '36px', fontSize: '15px' }}>
            Conversations with other builders
          </p>

          {/* Empty State */}
          {conversations.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: '16px',
              padding: '64px 40px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '42px', color: '#C5A059', marginBottom: '20px' }}>
                <i className="ti ti-message-circle"></i>
              </div>
              <h3 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '24px',
                color: '#1A1A1A',
                marginBottom: '10px'
              }}>
                No conversations yet
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
                Message someone from their project page to start a conversation.
              </p>
              <button
                onClick={() => router.push('/projects')}
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
                Browse projects
              </button>
            </div>
          ) : (
            /* Conversation List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversations.map((c) => (
                <div
                  key={c.userId}
                  onClick={() =>
                    router.push(
                      `/messages/${c.userId}?nickname=${encodeURIComponent(c.nickname)}`
                    )
                  }
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E0D8',
                    borderRadius: '14px',
                    padding: '18px 22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)')
                  }
                >
                  {/* Avatar */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#C5A059',
                    color: '#1A1A1A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    {(c.nickname || 'B').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#1A1A1A',
                      marginBottom: '4px'
                    }}>
                      {c.nickname}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6B6558',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {c.lastMessage}
                    </div>
                  </div>

                  {/* Arrow */}
                  <i className="ti ti-chevron-right" style={{ color: '#C5A059', fontSize: '18px' }}></i>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}