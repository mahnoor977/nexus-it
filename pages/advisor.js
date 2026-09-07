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
    'Suggest a project idea for me',
    'Review my tech stack',
    'Help me get unstuck',
    'Explain a concept simply',
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
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              letterSpacing: '0.15em',
              color: '#C5A059',
              marginBottom: '12px'
            }}>
              // AI ADVISOR
            </div>
            <h1 style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#1A1A1A',
              margin: 0
            }}>
              Hi {nickname.split(' ')[0]}. What shall we build today?
            </h1>
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
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', color: '#C5A059' }}>
                  <i className="ti ti-sparkles"></i>
                </div>
                <p style={{ color: '#6B6558', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                  Ask for a project idea, feedback on your approach, or help getting unstuck.
                </p>

                {/* Suggested Prompts */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      style={{
                        background: '#F7F4EE',
                        border: '1px solid #E5E0D8',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        color: '#1A1A1A',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#C5A059';
                        e.currentTarget.style.color = '#1A1A1A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F7F4EE';
                        e.currentTarget.style.color = '#1A1A1A';
                      }}
                    >
                      {prompt}
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
            gap: '12px',
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: '14px',
            padding: '8px 8px 8px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
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
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}