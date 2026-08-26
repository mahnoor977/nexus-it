import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      const nick = session.user.user_metadata?.nickname || session.user.email;
      setNickname(nick);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('projects').insert({
      user_id: session.user.id,
      author_nickname: nickname,
      title: title.trim(),
      description: description.trim(),
      tech_stack: techStack.trim() || null,
      github_url: githubUrl.trim() || null,
      demo_url: demoUrl.trim() || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/projects');
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>New Project — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <form className="new-project-form" style={{ margin: '40px auto', maxWidth: '640px' }} onSubmit={handleSubmit}>
            <h1>Post a project</h1>

            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Real-time chat app with WebSockets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                className="form-textarea"
                placeholder="What does it do? What did you learn building it? What feedback are you looking for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Tech stack</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <div className="field">
              <label>GitHub link (optional)</label>
              <input
                type="url"
                placeholder="https://github.com/you/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Live demo link (optional)</label>
              <input
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
            </div>

            {error && <div className="form-error" style={{ display: 'block', color: '#e35d5d', marginBottom: '16px' }}>{error}</div>}

            <button className="btn btn-solid" type="submit" disabled={saving} style={{ padding: '13px 30px' }}>
              {saving ? 'Posting…' : 'Post project'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}