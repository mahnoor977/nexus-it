import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function Advisor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace('/');
        return;
      }
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
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
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
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>AI Advisor — NEXUS-IT</title>
      </Head>
      <div className="advisor-page">
        <nav>
          <div className="logo">
            <button className="hamburger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
            <span>NEXUS-IT</span>
          </div>
          <div className="nav-links">
            <button className="btn" onClick={() => router.push('/dashboard')}>Back to dashboard</button>
          </div>
        </nav>

        <div className="advisor-chat">
          <div className="eyebrow mono" style={{ marginTop: '30px', marginBottom: '10px' }}>// AI ADVISOR</div>
          <div className="advisor-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="advisor-empty">
                Ask for a project idea, feedback on your approach, or help getting unstuck.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`advisor-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="advisor-msg assistant">Thinking…</div>}
          </div>

          {error && (
            <div className="form-error" style={{ display: 'block', color: '#e35d5d', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <div className="advisor-input-bar">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button onClick={handleSend} disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}