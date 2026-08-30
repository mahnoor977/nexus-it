import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';

export default function NewForumPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setNickname(session.user.user_metadata?.nickname || session.user.email);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('forum_posts').insert({
      user_id: session.user.id,
      author_nickname: nickname,
      title: title.trim(),
      body: body.trim(),
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/forum');
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>New Post — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <form className="new-project-form page-shell narrow" onSubmit={handleSubmit}>
            <h1>Start a discussion</h1>

            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Best resources for learning Docker?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Body</label>
              <textarea
                className="form-textarea"
                placeholder="Share details, ask your question, or start the discussion..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {error && <div className="form-error" style={{ display: 'block', color: '#e35d5d', marginBottom: '16px' }}>{error}</div>}

            <button className="btn btn-solid" type="submit" disabled={saving} style={{ padding: '13px 30px' }}>
              {saving ? 'Posting…' : 'Post discussion'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}