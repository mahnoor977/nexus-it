import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import Avatar from '../../components/Avatar';
import ReportBlockMenu from '../../components/ReportBlockMenu';

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myNickname, setMyNickname] = useState('');
  const [error, setError] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

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

      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', id);
      setFollowerCount((followersData || []).length);
      if (session) {
        setIsFollowing((followersData || []).some((f) => f.follower_id === session.user.id));
      }

      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', id);
      setFollowingCount((followingData || []).length);

      setLoading(false);
    }

    load();
  }, [id]);

  async function handleFollowToggle() {
    if (!currentUserId) {
      router.push('/');
      return;
    }

    setFollowBusy(true);

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }

    setFollowBusy(false);
  }

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
          <div className="profile-page-content page-shell medium">
            <div className="profile-header">
              <Avatar url={profile.avatar_url} nickname={profile.nickname} size={64} />
              <div className="profile-name-block">
                <h1>{profile.nickname || 'Unnamed builder'}</h1>
                <div className="profile-meta">
                  {followerCount} follower{followerCount !== 1 ? 's' : ''} · {followingCount} following · {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
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
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <button
                      className={isFollowing ? 'btn' : 'btn btn-solid'}
                      onClick={handleFollowToggle}
                      disabled={followBusy}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      className="btn"
                      onClick={() => router.push(`/messages/${id}?nickname=${encodeURIComponent(profile.nickname || '')}`)}
                    >
                      Message
                    </button>
                  </div>
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