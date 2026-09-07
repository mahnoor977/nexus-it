import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function ForumPostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        setNickname(session.user.user_metadata?.nickname || 'Builder');
      }

      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) {
        setError(postError.message);
        setLoading(false);
        return;
      }
      setPost(postData);

      const { data: repliesData } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      setReplies(repliesData || []);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handlePostReply() {
    const trimmed = replyText.trim();
    if (!trimmed || !currentUserId) return;

    setPosting(true);
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        post_id: id,
        user_id: currentUserId,
        author_nickname: nickname,
        content: trimmed,
      })
      .select()
      .single();

    setPosting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setReplies([...replies, data]);
    setReplyText('');
  }

  async function handleDeletePost() {
    if (!window.confirm('Delete this discussion? This cannot be undone.')) return;

    setDeleting(true);
    const { error } = await supabase.from('forum_posts').delete().eq('id', id);
    setDeleting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/forum');
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7', color: '#6B6558' }}>
        Loading…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7', color: '#6B6558' }}>
        {error || 'Post not found.'}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '720px' }}>

          <button
            onClick={() => router.push('/forum')}
            style={{ background: 'none', border: 'none', color: '#C5A059', fontSize: '14px', cursor: 'pointer', marginBottom: '24px', padding: 0 }}
          >
            ← Back to Forum
          </button>

          <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '28px', color: '#1A1A1A', marginBottom: '12px', lineHeight: 1.3 }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <span
              onClick={() => router.push(`/user/${post.user_id}`)}
              style={{ color: '#C5A059', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              by {post.author_nickname}
            </span>
            {post.user_id === currentUserId && (
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '13px', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting…' : 'Delete post'}
              </button>
            )}
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '36px',
            fontSize: '15px',
            lineHeight: 1.7,
            color: '#1A1A1A',
            whiteSpace: 'pre-wrap'
          }}>
            {post.body}
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '16px' }}>
            Replies ({replies.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {replies.length === 0 && (
              <p style={{ color: '#9C9482', fontSize: '14px' }}>No replies yet. Be the first to respond.</p>
            )}
            {replies.map((r) => (
              <div key={r.id} style={{
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '12px',
                padding: '16px 18px'
              }}>
                <div style={{ fontSize: '13px', color: '#C5A059', marginBottom: '6px', fontWeight: 500 }}>
                  {r.author_nickname}
                </div>
                <div style={{ fontSize: '14px', color: '#1A1A1A', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {r.content}
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: '#1A1A1A'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handlePostReply}
                disabled={posting || !replyText.trim()}
                style={{
                  background: posting || !replyText.trim() ? '#E5E0D8' : '#C5A059',
                  color: '#1A1A1A',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: posting || !replyText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {posting ? 'Posting…' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}