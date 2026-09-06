import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import Topbar from '../components/Topbar';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [profile, setProfile] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likesReceived, setLikesReceived] = useState(0);
  const [collaboratorCount, setCollaboratorCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      setProfile(profileData);

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      setMyProjects(projectsData || []);

      const projectIds = (projectsData || []).map((p) => p.id);

      if (projectIds.length > 0) {
        const { data: likesData } = await supabase
          .from('project_likes')
          .select('id')
          .in('project_id', projectIds);
        setLikesReceived((likesData || []).length);

        const { data: collabData } = await supabase
          .from('collaboration_requests')
          .select('id')
          .in('project_id', projectIds)
          .eq('status', 'approved');
        setCollaboratorCount((collabData || []).length);
      }

      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', uid);
      setFollowerCount((followersData || []).length);

      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', uid);
      setFollowingCount((followingData || []).length);

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  return (
    <>
      <Head>
        <title>Dashboard — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <Topbar nickname={nickname} />
          <Topbar nickname={nickname} />
          <div style={{ padding: '40px 5vw', maxWidth: '760px' }}>
            <div className="profile-header">
              <Avatar url={profile?.avatar_url} nickname={nickname} size={56} />
              <div className="profile-name-block">
                <h1 style={{ fontSize: '22px' }}>{nickname}</h1>
                <div className="profile-meta">Your dashboard</div>
              </div>
              <button
                className="btn"
                style={{ marginLeft: 'auto' }}
                onClick={() => router.push('/profile')}
              >
                Edit profile
              </button>
            </div>

            {profile?.bio && <p className="project-desc" style={{ marginBottom: '10px' }}>{profile.bio}</p>}
            {profile?.skills && (
              <div className="profile-tags-display">
                {profile.skills.split(',').map((s, i) => (
                  <span className="project-tag" key={i}>{s.trim()}</span>
                ))}
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-num">{myProjects.length}</div>
                <div className="stat-label">Projects</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{followerCount}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{followingCount}</div>
                <div className="stat-label">Following</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{likesReceived}</div>
                <div className="stat-label">Likes received</div>
              </div>
            </div>

            <div className="quick-actions">
              <button className="btn btn-solid" onClick={() => router.push('/new-project')}>+ New project</button>
              <button className="btn" onClick={() => router.push('/projects')}>Go to Home feed</button>
            </div>

            <h2 className="dash-section-label">Your projects</h2>

            {myProjects.length === 0 ? (
              <div className="projects-empty">You haven't posted a project yet.</div>
            ) : (
              <div className="projects-list">
                {myProjects.map((p) => (
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