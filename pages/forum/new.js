import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import AppLayout from '../../components/AppLayout';

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
      setNickname(session.user.user_metadata?.nickname || 'Builder');
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
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)', color: 'var(--muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>New Discussion · NEXUS-IT</title>
      </Head>

      <AppLayout nickname={nickname}>
        <div style={{ maxWidth: '640px' }}>
          <h1 className="page-title">
            Start a discussion
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>
            Ask a question or share something with the community.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Best resources for learning Docker?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '13px 16px', border: '1px solid var(--line)', borderRadius: '12px', fontSize: '15px', background: 'var(--panel)', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Body
              </label>
              <textarea
                placeholder="Share details, ask your question, or start the discussion..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={7}
                style={{ width: '100%', padding: '14px 16px', border: '1px solid var(--line)', borderRadius: '12px', fontSize: '15px', background: 'var(--panel)', color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>

            {error && <div style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

            <button
              type="submit"
              disabled={saving}
              style={{ background: saving ? 'var(--line)' : 'var(--tea)', color: '#1A1A1A', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 500, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Posting…' : 'Post discussion'}
            </button>
          </form>
        </div>
      </AppLayout>
    </>
  );
}