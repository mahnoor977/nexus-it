import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function Conversation() {
  const router = useRouter();
  const { userId, nickname: nicknameQuery } = router.query;
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myNickname, setMyNickname] = useState('');
  const [otherNickname, setOtherNickname] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

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

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    });
  }

  async function handleSend() {
    const trimmed = input.trim();
    if ((!trimmed && !attachedFile) || sending || !currentUserId) return;

    setSending(true);

    let mediaUrl = null;
    let mediaType = null;

    if (attachedFile) {
      const filePath = `${currentUserId}/${Date.now()}-${attachedFile.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('message-media')
        .upload(filePath, attachedFile.file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('message-media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
        mediaType = attachedFile.type;
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: userId,
        sender_nickname: myNickname,
        receiver_nickname: otherNickname || 'them',
        content: trimmed || '',
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single();

    setSending(false);

    if (!error) {
      setMessages([...messages, data]);
      setInput('');
      setAttachedFile(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopy(content) {
    navigator.clipboard.writeText(content);
  }

  function startEdit(msg) {
    setEditingId(msg.id);
    setEditText(msg.content);
  }

  async function saveEdit(msgId) {
    const trimmed = editText.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('messages')
      .update({ content: trimmed, edited: true })
      .eq('id', msgId);

    if (!error) {
      setMessages(messages.map((m) => m.id === msgId ? { ...m, content: trimmed, edited: true } : m));
      setEditingId(null);
    }
  }

  async function handleDelete(msgId) {
    const confirmed = window.confirm('Delete this message?');
    if (!confirmed) return;

    const { error } = await supabase.from('messages').delete().eq('id', msgId);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== msgId));
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
      <div className="app-shell">
        <Sidebar nickname={myNickname} />
        <div className="app-main">
          <div className="advisor-chat page-shell medium">
            <div className="eyebrow mono" style={{ marginBottom: '10px' }}>
              // CONVERSATION WITH {otherNickname ? otherNickname.toUpperCase() : '...'}
            </div>
            <div className="advisor-messages" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="advisor-empty">Say hello — this is the start of your conversation.</div>
              )}
                            {messages.map((m) => {
                const isMine = m.sender_id === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`msg-wrap ${isMine ? 'user' : 'assistant'}`}
                    onClick={() => setActiveMenuId(activeMenuId === m.id ? null : m.id)}
                  >
                    <div className={`msg-actions ${activeMenuId === m.id ? 'menu-open' : ''}`}>
                      {m.content && (
                        <button className="msg-action-btn" onClick={() => handleCopy(m.content)} title="Copy">
                          <i className="ti ti-copy"></i>
                        </button>
                      )}
                      {isMine && m.content && (
                        <button className="msg-action-btn" onClick={() => startEdit(m)} title="Edit">
                          <i className="ti ti-pencil"></i>
                        </button>
                      )}
                      {isMine && (
                        <button className="msg-action-btn" onClick={() => handleDelete(m.id)} title="Delete">
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>

                    <div className={`advisor-msg ${isMine ? 'user' : 'assistant'}`}>
                      {editingId === m.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            className="msg-edit-input"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(m.id)}
                            autoFocus
                          />
                          <button className="msg-action-btn" onClick={() => saveEdit(m.id)}>
                            <i className="ti ti-check"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          {m.content}
                          {m.edited && <span className="msg-edited-tag">(edited)</span>}
                          {m.media_url && (
                            m.media_type === 'video' ? (
                              <video src={m.media_url} controls className="msg-media" />
                            ) : (
                              <img src={m.media_url} alt="" className="msg-media" />
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {attachedFile && (
              <div className="attach-preview-bar">
                <div className="attach-preview-item">
                  {attachedFile.type === 'video' ? (
                    <video src={attachedFile.preview} muted />
                  ) : (
                    <img src={attachedFile.preview} alt="" />
                  )}
                  <button className="attach-preview-remove" onClick={() => setAttachedFile(null)}>×</button>
                </div>
              </div>
            )}

            <div className="advisor-input-bar">
              <button
                type="button"
                className="btn"
                style={{ padding: '0 14px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="ti ti-paperclip"></i>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button onClick={handleSend} disabled={sending || (!input.trim() && !attachedFile)}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}