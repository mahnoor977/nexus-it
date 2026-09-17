import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';

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
        background: 'var(--black)',
        color: 'var(--muted)'
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

      <AppLayout nickname={nickname}>
        <div className="advisor-shell">

          {/* Header */}
          <div style={{ marginBottom: '22px' }}>
            <h1 className="page-title">AI Advisor</h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>
              Project ideas, architecture feedback, and help getting unstuck, whenever you need it.
            </p>
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
                    border: '1px dashed var(--tea)',
                    opacity: 0.5
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px', left: '12px', right: '12px', bottom: '12px',
                    borderRadius: '50%',
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}>
                    <i className="ti ti-topology-star-3" style={{ fontSize: '32px', color: 'var(--tea)' }}></i>
                  </div>
                  <i className="ti ti-sparkles" style={{
                    position: 'absolute', top: '-4px', right: '4px',
                    fontSize: '16px', color: 'var(--tea-bright)'
                  }}></i>
                  <i className="ti ti-sparkles" style={{
                    position: 'absolute', bottom: '4px', left: '-8px',
                    fontSize: '12px', color: 'var(--tea-bright)', opacity: 0.7
                  }}></i>
                </div>

                <h2 style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: '26px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  margin: '0 0 10px'
                }}>
                  Hi {nickname.split(' ')[0]}. What shall we build today?
                </h2>

                <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
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
                        background: 'var(--panel)',
                        border: '1px solid var(--line)',
                        borderRadius: '999px',
                        padding: '10px 18px',
                        fontSize: '13.5px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--tea)';
                        e.currentTarget.style.borderColor = 'var(--tea)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--panel)';
                        e.currentTarget.style.borderColor = 'var(--line)';
                      }}
                    >
                      <i className={`ti ${item.icon}`} style={{ fontSize: '15px', color: 'var(--tea)' }}></i>
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
                  background: m.role === 'user' ? 'var(--tea)' : 'var(--panel)',
                  color: m.role === 'user' ? 'var(--text)' : 'var(--text)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--line)',
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
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '16px 16px 16px 4px',
                padding: '14px 18px',
                color: 'var(--muted)',
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
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: '14px',
            padding: '8px 8px 8px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <i className="ti ti-sparkles" style={{ fontSize: '16px', color: 'var(--tea)' }}></i>
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
                color: 'var(--text)'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: sending || !input.trim() ? 'var(--line)' : 'var(--tea)',
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
      </AppLayout>
    </>
  );
}