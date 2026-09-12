import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';

export default function Profile() {
  const router = useRouter();
  const galleryInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [gallery, setGallery] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [messagePrivacy, setMessagePrivacy] = useState('everyone');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }

      setUserId(session.user.id);
      setNickname(session.user.user_metadata?.nickname || 'Builder');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setBio(data.bio || '');
        setSkills(data.skills || '');
        setMessagePrivacy(data.message_privacy || 'everyone');
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
      .update({
        bio,
        skills,
        message_privacy: messagePrivacy,
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      setSaveMsg(error.message);
      return;
    }

    setSaveMsg('Profile saved');
    setTimeout(() => setSaveMsg(''), 2500);
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
          .insert({
            user_id: userId,
            media_url: urlData.publicUrl,
            media_type: type,
          })
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
    if (!window.confirm('Remove this from your gallery?')) return;

    const { error } = await supabase.from('profile_media').delete().eq('id', mediaId);
    if (!error) {
      setGallery(gallery.filter((m) => m.id !== mediaId));
    }
  }

  async function handleChangePassword() {
    setPasswordMsg('');

    if (newPassword.length < 8) {
      setPasswordMsg('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords don't match.");
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (error) {
      setPasswordMsg(error.message);
      return;
    }

    setPasswordMsg('Password updated successfully.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE exactly to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      // Optional: clean up user data if you have a function
      await supabase.auth.signOut();
      router.replace('/');
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFBF7',
        color: '#6B6558'
      }}>
        Loading profile…
      </div>
    );
  }

  const initials = (nickname || 'B').slice(0, 2).toUpperCase();

  return (
    <>
      <Head>
        <title>Profile · NEXUS-IT</title>
      </Head>

      <AppLayout nickname={nickname}>
        <div style={{ maxWidth: '680px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '36px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#C5A059',
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 600
            }}>
              {initials}
            </div>
            <div>
              <h1 className="page-title">
                {nickname}
              </h1>
              <p style={{ color: '#6B6558', fontSize: '14px', margin: '4px 0 0 0' }}>
                Your profile
              </p>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#6B6558', marginBottom: '8px' }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what you're building and what you're into..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #E5E0D8',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#FFFFFF',
                color: '#1A1A1A',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#6B6558', marginBottom: '8px' }}>
              Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Python, UI Design (comma separated)"
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '1px solid #E5E0D8',
                borderRadius: '12px',
                fontSize: '15px',
                background: '#FFFFFF',
                color: '#1A1A1A',
                outline: 'none'
              }}
            />
          </div>

          {/* Save Profile */}
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#C5A059',
                color: '#1A1A1A',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            {saveMsg && <span style={{ color: '#2e7d32', fontSize: '14px' }}>{saveMsg}</span>}
          </div>

          {/* Who can message you */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '14px' }}>
              Who can message you
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMessagePrivacy('everyone')}
                style={{
                  background: messagePrivacy === 'everyone' ? '#C5A059' : 'transparent',
                  color: messagePrivacy === 'everyone' ? '#1A1A1A' : '#6B6558',
                  border: '1px solid #C5A059',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Everyone
              </button>
              <button
                onClick={() => setMessagePrivacy('followers')}
                style={{
                  background: messagePrivacy === 'followers' ? '#C5A059' : 'transparent',
                  color: messagePrivacy === 'followers' ? '#1A1A1A' : '#6B6558',
                  border: '1px solid #C5A059',
                  padding: '10px 18px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Only people I follow back
              </button>
            </div>
          </div>

          {/* Gallery */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
              Photos and videos on your profile
            </h3>
            <p style={{ color: '#6B6558', fontSize: '14px', marginBottom: '16px' }}>
              Not tied to any specific project.
            </p>

            <input
              type="file"
              ref={galleryInputRef}
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleGalleryUpload}
            />

            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={galleryUploading}
              style={{
                background: 'transparent',
                border: '1px solid #C5A059',
                color: '#C5A059',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              {galleryUploading ? 'Uploading…' : '+ Add photos or videos'}
            </button>

            {gallery.length === 0 ? (
              <p style={{ color: '#9C9482', fontSize: '14px' }}>
                No media yet — add some photos or videos.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {gallery.map((m) => (
                  <div key={m.id} style={{ position: 'relative' }}>
                    {m.media_type === 'video' ? (
                      <video
                        src={m.media_url}
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                        controls
                      />
                    ) : (
                      <img
                        src={m.media_url}
                        alt=""
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                      />
                    )}
                    <button
                      onClick={() => handleDeleteMedia(m.id)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div style={{
            borderTop: '1px solid #E5E0D8',
            paddingTop: '36px',
            marginBottom: '48px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', marginBottom: '20px' }}>
              Change password
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B6558', marginBottom: '6px' }}>
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E0D8',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B6558', marginBottom: '6px' }}>
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E0D8',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              style={{
                background: 'transparent',
                border: '1px solid #C5A059',
                color: '#C5A059',
                padding: '11px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {passwordSaving ? 'Updating…' : 'Update password'}
            </button>

            {passwordMsg && (
              <p style={{
                marginTop: '12px',
                fontSize: '14px',
                color: passwordMsg.includes('success') ? '#2e7d32' : '#c0392b'
              }}>
                {passwordMsg}
              </p>
            )}
          </div>

          {/* DANGER ZONE */}
          <div style={{
            borderTop: '1px solid #E5E0D8',
            paddingTop: '36px',
            marginBottom: '60px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#c0392b', marginBottom: '10px' }}>
              Delete account
            </h3>
            <p style={{ color: '#6B6558', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
              This permanently removes your projects, posts, comments, and gallery. Type <strong>DELETE</strong> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '12px 16px',
                border: '1px solid #E5E0D8',
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                marginBottom: '14px'
              }}
            />

            <br />

            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== 'DELETE'}
              style={{
                background: 'transparent',
                border: '1px solid #c0392b',
                color: '#c0392b',
                padding: '11px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: deleting || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer',
                opacity: deleteConfirmText !== 'DELETE' ? 0.5 : 1
              }}
            >
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>

            {deleteError && (
              <p style={{ color: '#c0392b', fontSize: '14px', marginTop: '12px' }}>
                {deleteError}
              </p>
            )}
          </div>

        </div>
      </AppLayout>
    </>
  );
}