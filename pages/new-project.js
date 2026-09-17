import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';

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
      setNickname(session.user.user_metadata?.nickname || 'Builder');
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
    setMediaFiles((prev) => [...prev, ...withPreviews].slice(0, 6));
  }

  function removeMediaFile(index) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
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

    // Upload media if any
    for (const item of mediaFiles) {
      const filePath = `${userId}/${projectData.id}/${Date.now()}-${item.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, item.file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('project-media')
          .getPublicUrl(filePath);

        await supabase.from('project_media').insert({
          project_id: projectData.id,
          media_url: urlData.publicUrl,
          media_type: item.type,
        });
      }
    }

    setSaving(false);
    router.push(`/project/${projectData.id}`);
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black)',
        color: 'var(--muted)'
      }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Post a project · NEXUS-IT</title>
      </Head>

      <AppLayout nickname={nickname}>
        <div style={{ maxWidth: '1020px' }}>

          <h1 className="page-title">
            Post a project
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '36px' }}>
            Share what you built and get feedback from other builders.
          </p>

          <div className="posts-layout posts-layout-fill">
          <div style={{ maxWidth: '640px' }}>
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Real-time chat app with WebSockets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Description
              </label>
              <textarea
                placeholder="What does it do? What did you learn building it? What feedback are you looking for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.5
                }}
              />
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Tech Stack
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>

            {/* GitHub */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                GitHub Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/you/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Live Demo */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Live Demo Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Media Upload */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Screenshots or short videos (optional, up to 6)
              </label>

              <label
                htmlFor="media-input"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px dashed var(--line)',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  cursor: 'pointer',
                  background: 'var(--panel)',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--tea)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}
              >
                <i className="ti ti-photo-plus" style={{ fontSize: '28px', color: 'var(--tea)', marginBottom: '10px' }}></i>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
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
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  {mediaFiles.map((item, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      {item.type === 'video' ? (
                        <video
                          src={item.preview}
                          muted
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />
                      ) : (
                        <img
                          src={item.preview}
                          alt=""
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMediaFile(i)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.65)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? 'var(--line)' : 'var(--tea)',
                color: '#1A1A1A',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 500,
                fontSize: '15px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Posting…' : 'Post project'}
            </button>
          </form>
          </div>

          <aside className="posts-side">
            <div className="side-card">
              <h3><i className="ti ti-bulb"></i> Make it stand out</h3>
              <ul className="side-tips">
                <li><i className="ti ti-check"></i>Lead with what it does, not what it&apos;s built with.</li>
                <li><i className="ti ti-check"></i>Say what you learned and what feedback you want.</li>
                <li><i className="ti ti-check"></i>Screenshots or a short clip double the attention.</li>
                <li><i className="ti ti-check"></i>A live demo link beats a thousand words.</li>
              </ul>
            </div>

            <div className="side-card">
              <h3><i className="ti ti-users"></i> After you post</h3>
              <ul className="side-tips">
                <li><i className="ti ti-check"></i>Your project gets its own page and feedback thread.</li>
                <li><i className="ti ti-check"></i>Builders can request to join as collaborators.</li>
                <li><i className="ti ti-check"></i>Its tech stack becomes browsable on the Tech Stack page.</li>
              </ul>
            </div>
          </aside>
          </div>
        </div>
      </AppLayout>
    </>
  );
}