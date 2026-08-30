import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function Posts() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeText, setComposeText] = useState('');
  const [composeFiles, setComposeFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setNickname(session.user.user_metadata?.nickname || session.user.email);
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      const postIds = (postsData || []).map((p) => p.id);

      const { data: mediaData } = await supabase
        .from('post_media')
        .select('*')
        .in('post_id', postIds.length > 0 ? postIds : ['00000000-0000-0000-0000-000000000000']);

      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id');

      const mediaByPost = {};
      (mediaData || []).forEach((m) => {
        if (!mediaByPost[m.post_id]) mediaByPost[m.post_id] = [];
        mediaByPost[m.post_id].push(m);
      });

      const likeCounts = {};
      const myLikes = new Set();
      (likesData || []).forEach((l) => {
        likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
        if (session && l.user_id === session.user.id) myLikes.add(l.post_id);
      });

      setPosts((postsData || []).map((p) => ({
        ...p,
        media: mediaByPost[p.id] || [],
        likeCount: likeCounts[p.id] || 0,
      })));
      setLikedIds(myLikes);
      setLoading(false);
    }
    load();
  }, []);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const withPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setComposeFiles([...composeFiles, ...withPreviews].slice(0, 4));
  }

  function extractHashtags(text) {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return matches ? matches.join(' ') : null;
  }

  async function handlePost() {
    const trimmed = composeText.trim();
    if (!trimmed || !userId) return;

    setPosting(true);

    const { data: postData, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        author_nickname: nickname,
        content: trimmed,
        hashtags: extractHashtags(trimmed),
      })
      .select()
      .single();

    if (error) {
      setPosting(false);
      return;
    }

    const uploadedMedia = [];
    for (const item of composeFiles) {
      const filePath = `${userId}/${postData.id}/${Date.now()}-${item.file.name}`;
      const { error: uploadError } = await supabase.storage.from('post-media').upload(filePath, item.file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath);
        const { data: mediaRow } = await supabase
          .from('post_media')
          .insert({ post_id: postData.id, media_url: urlData.publicUrl, media_type: item.type })
          .select()
          .single();
        if (mediaRow) uploadedMedia.push(mediaRow);
      }
    }

    setPosts([{ ...postData, media: uploadedMedia, likeCount: 0 }, ...posts]);
    setComposeText('');
    setComposeFiles([]);
    setPosting(false);
  }

  async function handleLike(postId) {
    if (!userId) { router.push('/'); return; }

    const isLiked = likedIds.has(postId);
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      const s = new Set(likedIds); s.delete(postId); setLikedIds(s);
      setPosts(posts.map((p) => p.id === postId ? { ...p, likeCount: p.likeCount - 1 } : p));
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      const s = new Set(likedIds); s.add(postId); setLikedIds(s);
      setPosts(posts.map((p) => p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p));
    }
  }

  function renderContentWithHashtags(text) {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) =>
      part.startsWith('#') ? <span className="post-hashtag" key={i}>{part}</span> : part
    );
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <>
      <Head>
        <title>Posts — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="page-shell narrow">
            <h1 style={{ marginBottom: '24px' }}>Posts</h1>

            {userId && (
              <div className="post-compose-box">
                <textarea
                  placeholder="Share an update, a thought, or what you're working on... use #hashtags"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                />
                {composeFiles.length > 0 && (
                  <div className="media-preview-grid">
                    {composeFiles.map((item, i) => (
                      <div className="media-preview-item" key={i}>
                        {item.type === 'video' ? <video src={item.preview} muted /> : <img src={item.preview} alt="" />}
                        <button
                          type="button"
                          className="media-preview-remove"
                          onClick={() => setComposeFiles(composeFiles.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="post-compose-actions">
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="ti ti-photo-plus"></i> Media
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button
                    className="btn btn-solid"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                    onClick={handlePost}
                    disabled={posting || !composeText.trim()}
                  >
                    {posting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            )}

            {loading && <div className="projects-empty">Loading posts…</div>}

            {!loading && posts.length === 0 && (
              <div className="projects-empty">No posts yet — share the first update.</div>
            )}

            {posts.map((p) => (
              <div className="post-card" key={p.id}>
                <div className="post-card-header">
                  <span
                    className="post-author-name"
                    onClick={() => router.push(`/user/${p.user_id}`)}
                  >
                    {p.author_nickname}
                  </span>
                  <span className="post-time">{timeAgo(p.created_at)}</span>
                </div>

                <div className="post-content">{renderContentWithHashtags(p.content)}</div>

                {p.media.length > 0 && (
                  <div className={`post-media-grid count-${p.media.length === 1 ? '1' : p.media.length === 2 ? '2' : '3plus'}`}>
                    {p.media.map((m) => (
                      m.media_type === 'video'
                        ? <video src={m.media_url} controls key={m.id} />
                        : <img src={m.media_url} alt="" key={m.id} />
                    ))}
                  </div>
                )}

                <button
                  className={`like-btn ${likedIds.has(p.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(p.id)}
                >
                  <i className="ti ti-heart"></i> {p.likeCount}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}