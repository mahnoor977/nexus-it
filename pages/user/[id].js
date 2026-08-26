import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import Avatar from '../../components/Avatar';

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myNickname, setMyNickname] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        setMyNickname(session.user.user_metadata?.nickname || session.user.email);
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        setError('Profile not found.');
        setLoading(false);
        return;
      }
      setProfile(profileData);

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  if (error || !profile) {
    return <div className="dash-loading mono">{error}</div>;
  }

  const isOwnProfile = currentUserId === id;

  return (
    <>
      <Head>
        <title>{profile.nickname || 'Profile'} — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={myNickname} />
        <div className="app-main">
          <div className="profile-page-content">
            <div className="profile-header">
              <Avatar url={profile.avatar_url} nickname={profile.nickname} size={64} />
              <div className="profile-name-block">
                <h1>{profile.nickname || 'Unnamed builder'}</h1>
                <div className="profile-meta">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
              </div>
              {isOwnProfile ? (
                <button
                  className="btn"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => router.push('/profile')}
                >
                  Edit profile
                </button>
              ) : (
                currentUserId && (
                  <button
                    className="btn btn-solid"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => router.push(`/messages/${id}?nickname=${encodeURIComponent(profile.nickname || '')}`)}
                  >
                    Message
                  </button>
                )
              )}
            </div>

            {profile.bio && <p className="project-desc" style={{ marginBottom: '18px' }}>{profile.bio}</p>}

            {profile.skills && (
              <div className="profile-tags-display">
                {profile.skills.split(',').map((skill, i) => (
                  <span className="project-tag" key={i}>{skill.trim()}</span>
                ))}
              </div>
            )}

            <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>Projects</h2>

            {projects.length === 0 ? (
              <div className="comments-empty">No projects posted yet.</div>
            ) : (
              <div className="projects-list">
                {projects.map((p) => (
                  <div
                    className="project-card project-card-link"
                    key={p.id}
                    onClick={() => router.push(`/project/${p.id}`)}
                  >
                    <div className="project-card-top">
                      <h3>{p.title}</h3>
                    </div>
                    <p className="project-desc">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}