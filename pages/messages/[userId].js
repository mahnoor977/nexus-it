import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import MobileMenu from '../../components/MobileMenu';

export default function Conversation() {
  const router = useRouter();
  const { userId, nickname: nicknameQuery } = router.query;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myNickname, setMyNickname] = useState('');
  const [otherNickname, setOtherNickname] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      const myId = session.user.id;
      setCurrentUserId(myId);
      setMyNickname(session.user.user_metadata?.nickname || session.user.email);
      if (nicknameQuery) setOtherNickname(nicknameQuery);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${myId})`
        )
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        if (!nicknameQuery && data.length > 0) {
          const fromOther = data.find((m) => m.sender_id === userId);
          if (fromOther) setOtherNickname(fromOther.sender_nickname);
        }
      }
      setLoading(false);
    }
    load();
  }, [userId, nicknameQuery, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending || !currentUserId) return;

    setSending(true);
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: userId,
        sender_nickname: myNickname,
        receiver_nickname: otherNickname || 'them',
        content: trimmed,
      })
      .select()
      .single();

    setSending(false);

    if (!error) {
      setMessages([...messages, data]);
      setInput('');
    }
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
        <title>{otherNickname || 'Conversation'} — NEXUS-IT</title>
      </Head>
      <div className="advisor-page">
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
            <button className="btn" onClick={() => router.push('/messages')}>Back to messages</button>
          </div>
        </nav>

        <div className="advisor-chat">
          <div className="eyebrow mono" style={{ marginTop: '30px', marginBottom: '10px' }}>
            // CONVERSATION WITH {otherNickname ? otherNickname.toUpperCase() : '...'}
          </div>
          <div className="advisor-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="advisor-empty">Say hello — this is the start of your conversation.</div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`advisor-msg ${m.sender_id === currentUserId ? 'user' : 'assistant'}`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="advisor-input-bar">
            <input
              type="text"
              placeholder="Type a message..."
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