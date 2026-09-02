import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [gallery, setGallery] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setBio(data.bio || '');
        setSkills(data.skills || '');
        setAvatarUrl(data.avatar_url || '');
      }

      const { data: mediaData } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setGallery(mediaData || []);

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');

    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio.trim(), skills: skills.trim() })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      setSaveMsg(error.message);
      return;
    }
    setSaveMsg('Saved.');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setSaveMsg(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newUrl })
      .eq('id', userId);

    setUploading(false);

    if (updateError) {
      setSaveMsg(updateError.message);
      return;
    }

    setAvatarUrl(newUrl);
  }

  async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryUploading(true);

    for (const file of files) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const filePath = `${userId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('profile-media').getPublicUrl(filePath);
        const { data: mediaRow } = await supabase
          .from('profile_media')
          .insert({ user_id: userId, media_url: urlData.publicUrl, media_type: type })
          .select()
          .single();

        if (mediaRow) {
          setGallery((prev) => [mediaRow, ...prev]);
        }
      }
    }

    setGalleryUploading(false);
  }

  async function handleDeleteMedia(mediaId) {
    const confirmed = window.confirm('Remove this from your gallery?');
    if (!confirmed) return;

    const { error } = await supabase.from('profile_media').delete().eq('id', mediaId);
    if (!error) {
      setGallery(gallery.filter((m) => m.id !== mediaId));
    }
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>Your Profile — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="profile-page-content page-shell medium">
            <div className="profile-header">
              <div
                className="avatar-upload-wrap"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar url={avatarUrl} nickname={nickname} size={64} />
                <div className="avatar-upload-overlay">
                  {uploading ? '...' : 'Change'}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <div className="profile-name-block">
                <h1>{nickname}</h1>
                <div className="profile-meta">Your profile</div>
              </div>
            </div>

            <label className="field-label mono" style={{ display: 'block', marginBottom: '8px' }}>Bio</label>
            <textarea
              className="profile-bio-textarea"
              placeholder="Tell people what you're building and what you're into..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <label className="field-label mono" style={{ display: 'block', marginBottom: '8px' }}>Skills</label>
            <input
              type="text"
              placeholder="e.g. React, Python, UI Design (comma separated)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              style={{
                width: '100%', background: 'var(--panel)', border: '1px solid var(--line)',
                color: 'var(--text)', padding: '13px 14px', fontSize: '14.5px', outline: 'none',
                fontFamily: "'IBM Plex Sans',sans-serif", marginBottom: '20px'
              }}
            />

            {saveMsg && <div className="field-hint" style={{ marginBottom: '12px' }}>{saveMsg}</div>}

            <button className="btn btn-solid" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>

            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--line)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>Gallery</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                Photos and videos on your profile — not tied to any specific project.
              </p>

              <button
                className="btn"
                onClick={() => galleryInputRef.current?.click()}
                disabled={galleryUploading}
                style={{ marginBottom: '20px' }}
              >
                <i className="ti ti-photo-plus"></i> {galleryUploading ? 'Uploading…' : 'Add photos or videos'}
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleGalleryUpload}
              />

              {gallery.length === 0 ? (
                <div className="comments-empty">No media yet — add some photos or videos.</div>
              ) : (
                <div className="media-gallery">
                  {gallery.map((m) => (
                    <div className="media-gallery-item" key={m.id} style={{ position: 'relative' }}>
                      {m.media_type === 'video' ? (
                        <video src={m.media_url} controls />
                      ) : (
                        <img src={m.media_url} alt="" />
                      )}
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                          borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
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