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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '36px'
          }}>
            <div>
              <h1 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '38px',
                color: '#1A1A1A',
                marginBottom: '10px'
              }}>
                Messages
              </h1>
              <div style={{ width: '48px', height: '3px', background: '#C5A059', borderRadius: '999px' }} />
            </div>

            {/* Decorative header icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingTop: '6px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <i className="ti ti-bell" style={{ fontSize: '20px', color: '#1A1A1A' }}></i>
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#C5A059'
                }} />
              </div>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '1px solid #E5E0D8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <i className="ti ti-help" style={{ fontSize: '15px', color: '#6B6558' }}></i>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {conversations.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: '20px',
              padding: '72px 40px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              {/* Illustration cluster */}
              <div style={{
                position: 'relative',
                width: '180px',
                height: '110px',
                margin: '0 auto 28px'
              }}>
                <i className="ti ti-leaf" style={{
                  position: 'absolute', bottom: '0', left: '10px',
                  fontSize: '30px', color: '#E5E0D8', transform: 'rotate(-20deg)'
                }}></i>
                <i className="ti ti-leaf" style={{
                  position: 'absolute', bottom: '0', right: '10px',
                  fontSize: '30px', color: '#E5E0D8', transform: 'rotate(20deg) scaleX(-1)'
                }}></i>

                <div style={{
                  position: 'absolute', top: '10px', left: '46px',
                  width: '52px', height: '38px', borderRadius: '14px 14px 14px 4px',
                  background: '#EBD9BC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '18px', color: '#8A6E3F' }}></i>
                </div>

                <div style={{
                  position: 'absolute', top: '38px', right: '30px',
                  width: '48px', height: '36px', borderRadius: '14px 14px 4px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '16px', color: '#C5A059' }}></i>
                </div>

                <div style={{
                  position: 'absolute', bottom: '4px', left: '68px',
                  width: '44px', height: '32px', borderRadius: '14px 14px 14px 4px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '14px', color: '#C5A059' }}></i>
                </div>
              </div>

              <h3 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '26px',
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
                Message someone from their project page to start one.
              </p>
              <button
                onClick={() => router.push('/projects')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#8A6E3F',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <i className="ti ti-compass"></i>
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