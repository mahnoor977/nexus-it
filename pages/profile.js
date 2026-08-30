import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      setNickname(session.user.user_metadata?.nickname || session.user.email);

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

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

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
          </div>
        </div>
      </div>
    </>
  );
}