import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import AppLayout from '../../components/AppLayout';

export default function Messages() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [conversations, setConversations] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const notifRef = useRef(null);
  const helpRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setShowHelp(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black)',
        color: 'var(--muted)'
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

      <AppLayout nickname={nickname}>
        <div style={{ maxWidth: '1100px' }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '36px'
          }}>
            <div>
              <h1 className="page-title">
                Messages
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
                Direct conversations with other builders.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingTop: '6px' }}>

              <div ref={notifRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <i className="ti ti-bell" style={{ fontSize: '20px', color: 'var(--text)' }}></i>
                  {conversations.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-2px', right: '-2px',
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: 'var(--tea)'
                    }} />
                  )}
                </div>

                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    right: 0,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    width: '300px',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    zIndex: 200
                  }}>
                    <div style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--line)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)'
                    }}>
                      Conversations
                    </div>
                    {conversations.length === 0 ? (
                      <div style={{ padding: '20px 18px', fontSize: '13.5px', color: 'var(--muted)' }}>
                        Nothing here yet.
                      </div>
                    ) : (
                      conversations.slice(0, 8).map((c) => (
                        <div
                          key={c.userId}
                          onClick={() => {
                            setShowNotifications(false);
                            router.push(`/messages/${c.userId}?nickname=${encodeURIComponent(c.nickname)}`);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 18px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--line)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel-2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--tea)', color: '#1A1A1A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 600, flexShrink: 0
                          }}>
                            {(c.nickname || 'B').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>
                              {c.nickname}
                            </div>
                            <div style={{
                              fontSize: '12px', color: 'var(--muted)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                              {c.lastMessage}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div ref={helpRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className="ti ti-help" style={{ fontSize: '15px', color: 'var(--muted)' }}></i>
                </div>

                {showHelp && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    right: 0,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    width: '260px',
                    padding: '18px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    zIndex: 200
                  }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                      About messages
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                      Start a conversation from any project page. You can edit or delete your own
                      messages, and delete an entire conversation from within the chat.
                    </p>
                    <a
                      href="mailto:support@nexus-it.dev"
                      style={{ fontSize: '13px', color: 'var(--tea)', fontWeight: 500 }}
                    >
                      Need more help? Contact support →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="posts-layout posts-layout-fill">
          <div>
          {conversations.length === 0 ? (
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              padding: '72px 40px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                position: 'relative',
                width: '180px',
                height: '110px',
                margin: '0 auto 28px'
              }}>
                <i className="ti ti-leaf" style={{
                  position: 'absolute', bottom: '0', left: '10px',
                  fontSize: '30px', color: 'var(--line)', transform: 'rotate(-20deg)'
                }}></i>
                <i className="ti ti-leaf" style={{
                  position: 'absolute', bottom: '0', right: '10px',
                  fontSize: '30px', color: 'var(--line)', transform: 'rotate(20deg) scaleX(-1)'
                }}></i>

                <div style={{
                  position: 'absolute', top: '10px', left: '46px',
                  width: '52px', height: '38px', borderRadius: '14px 14px 14px 4px',
                  background: 'var(--army-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '18px', color: 'var(--tea)' }}></i>
                </div>

                <div style={{
                  position: 'absolute', top: '38px', right: '30px',
                  width: '48px', height: '36px', borderRadius: '14px 14px 4px 14px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '16px', color: 'var(--tea)' }}></i>
                </div>

                <div style={{
                  position: 'absolute', bottom: '4px', left: '68px',
                  width: '44px', height: '32px', borderRadius: '14px 14px 14px 4px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <i className="ti ti-dots" style={{ fontSize: '14px', color: 'var(--tea)' }}></i>
                </div>
              </div>

              <h3 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '26px',
                color: 'var(--text)',
                marginBottom: '10px'
              }}>
                No conversations yet
              </h3>
              <p style={{
                color: 'var(--muted)',
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
                  background: 'var(--tea)',
                  color: 'var(--panel)',
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
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
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
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--tea)',
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

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {c.nickname}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {c.lastMessage}
                    </div>
                  </div>

                  <i className="ti ti-chevron-right" style={{ color: 'var(--tea)', fontSize: '18px' }}></i>
                </div>
              ))}
            </div>
          )}
          </div>

          <aside className="posts-side">
            <div className="side-card">
              <h3><i className="ti ti-message-plus"></i> Start a conversation</h3>
              <ul className="side-tips">
                <li><i className="ti ti-check"></i>Open any project and hit &ldquo;Message&rdquo; on its builder.</li>
                <li><i className="ti ti-check"></i>Or visit a profile from the community and say hi.</li>
                <li><i className="ti ti-check"></i>Share screenshots and short clips right in the chat.</li>
              </ul>
              <button
                className="btn btn-solid"
                style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '13px' }}
                onClick={() => router.push('/projects')}
              >
                Browse projects
              </button>
            </div>

            <div className="side-card">
              <h3><i className="ti ti-shield-lock"></i> Your space, your rules</h3>
              <ul className="side-tips">
                <li><i className="ti ti-check"></i>Edit or delete your own messages anytime.</li>
                <li><i className="ti ti-check"></i>Block anyone from their profile. Blocked users can&apos;t reach you.</li>
                <li><i className="ti ti-check"></i>Control who can message you in <a href="/profile" style={{ color: 'var(--tea)' }}>Settings</a>.</li>
              </ul>
            </div>
          </aside>
          </div>
        </div>
      </AppLayout>
    </>
  );
}