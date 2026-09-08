import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function Advisor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const suggestedPrompts = [
    { label: 'Suggest a project idea', icon: 'ti-bulb' },
    { label: 'Review my tech stack', icon: 'ti-stack-2' },
    { label: 'Help me get unstuck', icon: 'ti-refresh' },
    { label: 'Explain a concept', icon: 'ti-file-text' },
  ];

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace('/');
        return;
      }
      setNickname(session.user.user_metadata?.nickname || 'Builder');
      setLoading(false);
    }
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/');
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function handleSend(customMessage) {
    const trimmed = (customMessage || input).trim();
    if (!trimmed || sending) return;

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSending(false);
        return;
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError('Could not reach the advisor. Try again.');
    }
    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

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
        Loading…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Advisor · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '40px 24px 100px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Header */}
          <div style={{ marginBottom: '8px', textAlign: 'center' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              letterSpacing: '0.15em',
              color: '#C5A059',
              marginBottom: '24px'
            }}>
              // AI ADVISOR
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Empty State */}
            {messages.length === 0 && !sending && (
              <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>

                {/* Decorative network icon */}
                <div style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 32px'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '1px dashed #C5A059',
                    opacity: 0.5
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px', left: '12px', right: '12px', bottom: '12px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid #E5E0D8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}>
                    <i className="ti ti-topology-star-3" style={{ fontSize: '32px', color: '#C5A059' }}></i>
                  </div>
                  <i className="ti ti-sparkles" style={{
                    position: 'absolute', top: '-4px', right: '4px',
                    fontSize: '16px', color: '#D4AF37'
                  }}></i>
                  <i className="ti ti-sparkles" style={{
                    position: 'absolute', bottom: '4px', left: '-8px',
                    fontSize: '12px', color: '#D4AF37', opacity: 0.7
                  }}></i>
                </div>

                <h1 style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: '32px',
                  fontWeight: 400,
                  color: '#1A1A1A',
                  margin: '0 0 12px'
                }}>
                  Hi {nickname.split(' ')[0]}. What shall we build today?
                </h1>

                <p style={{ color: '#6B6558', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                  Ask for a project idea, feedback on your approach, or help getting unstuck.
                </p>

                {/* Suggested Prompts with icons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {suggestedPrompts.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSend(item.label)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E0D8',
                        borderRadius: '999px',
                        padding: '10px 18px',
                        fontSize: '13.5px',
                        color: '#1A1A1A',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#C5A059';
                        e.currentTarget.style.borderColor = '#C5A059';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E5E0D8';
                      }}
                    >
                      <i className={`ti ${item.icon}`} style={{ fontSize: '15px', color: '#C5A059' }}></i>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#C5A059' : '#FFFFFF',
                  color: m.role === 'user' ? '#1A1A1A' : '#1A1A1A',
                  border: m.role === 'user' ? 'none' : '1px solid #E5E0D8',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '14px 18px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.content}
              </div>
            ))}

            {/* Thinking indicator */}
            {sending && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '16px 16px 16px 4px',
                padding: '14px 18px',
                color: '#6B6558',
                fontSize: '14px'
              }}>
                Thinking…
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ color: '#c0392b', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Input Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: '14px',
            padding: '8px 8px 8px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <i className="ti ti-sparkles" style={{ fontSize: '16px', color: '#C5A059' }}></i>
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                background: 'transparent',
                color: '#1A1A1A'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: sending || !input.trim() ? '#E5E0D8' : '#C5A059',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Send <i className="ti ti-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}