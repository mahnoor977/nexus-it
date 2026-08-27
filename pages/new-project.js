import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      setNickname(session.user.user_metadata?.nickname || session.user.email);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const withPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setMediaFiles([...mediaFiles, ...withPreviews].slice(0, 6));
  }

  function removeMediaFile(index) {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSaving(true);

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        author_nickname: nickname,
        title: title.trim(),
        description: description.trim(),
        tech_stack: techStack.trim() || null,
        github_url: githubUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
      })
      .select()
      .single();

    if (projectError) {
      setError(projectError.message);
      setSaving(false);
      return;
    }

    for (const item of mediaFiles) {
      const filePath = `${userId}/${projectData.id}/${Date.now()}-${item.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, item.file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('project-media').getPublicUrl(filePath);
        await supabase.from('project_media').insert({
          project_id: projectData.id,
          user_id: userId,
          media_url: urlData.publicUrl,
          media_type: item.type,
        });
      }
    }

    setSaving(false);
    router.push(`/project/${projectData.id}`);
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

            <div className="field">
              <label>Screenshots or short videos (optional, up to 6)</label>
              <label className="media-upload-area" htmlFor="media-input">
                <i className="ti ti-photo-plus" style={{ fontSize: '22px', color: 'var(--muted)' }}></i>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
                  Click to add images or short video clips
                </div>
              </label>
              <input
                id="media-input"
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              {mediaFiles.length > 0 && (
                <div className="media-preview-grid">
                  {mediaFiles.map((item, i) => (
                    <div className="media-preview-item" key={i}>
                      {item.type === 'video' ? (
                        <video src={item.preview} muted />
                      ) : (
                        <img src={item.preview} alt="" />
                      )}
                      <button
                        type="button"
                        className="media-preview-remove"
                        onClick={() => removeMediaFile(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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