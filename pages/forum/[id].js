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
        setNickname(session.user.user_metadata?.nickname || session.user.email);
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

      const { data: repliesData, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (!repliesError) setReplies(repliesData);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handlePostReply() {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    if (!currentUserId) {
      router.push('/');
      return;
    }

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

  async function handleDeleteReply(replyId) {
    const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);
    if (!error) {
      setReplies(replies.filter((r) => r.id !== replyId));
    }
  }

  async function handleDeletePost() {
    const confirmed = window.confirm('Delete this discussion? This cannot be undone.');
    if (!confirmed) return;

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
    return <div className="dash-loading mono">Loading…</div>;
  }

  if (error || !post) {
    return <div className="dash-loading mono">{error || 'Post not found.'}</div>;
  }

  return (
    <>
      <Head>
        <title>{post.title} — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="project-detail" style={{ margin: '40px auto 0', maxWidth: '760px', padding: '0 5vw' }}>
            <div className="project-detail-top">
              <h1>{post.title}</h1>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span
                  className="project-author"
                  onClick={() => router.push(`/user/${post.user_id}`)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  by {post.author_nickname}
                </span>
                {post.user_id === currentUserId && (
                  <button className="comment-delete" onClick={handleDeletePost} disabled={deleting}>
                    {deleting ? 'deleting…' : 'delete post'}
                  </button>
                )}
              </div>
            </div>

            <p className="project-desc">{post.body}</p>

            <div className="comments-section">
              <h2>Replies ({replies.length})</h2>

              <div className="comment-form">
                <input
                  type="text"
                  placeholder={currentUserId ? "Write a reply..." : "Log in to reply"}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostReply()}
                  disabled={!currentUserId || posting}
                />
                <button onClick={handlePostReply} disabled={!currentUserId || posting || !replyText.trim()}>
                  {posting ? 'Posting…' : 'Reply'}
                </button>
              </div>

              {replies.length === 0 ? (
                <div className="comments-empty">No replies yet — be the first.</div>
              ) : (
                <div className="comment-list">
                  {replies.map((r) => (
                    <div className="comment-item" key={r.id}>
                      <div className="comment-item-top">
                        <span
                          className="comment-author"
                          onClick={() => router.push(`/user/${r.user_id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {r.author_nickname}
                        </span>
                        {r.user_id === currentUserId && (
                          <button className="comment-delete" onClick={() => handleDeleteReply(r.id)}>
                            delete
                          </button>
                        )}
                      </div>
                      <div className="comment-content">{r.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}