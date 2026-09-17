import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';

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

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }

      const uid = session.user.id;
      setUserId(uid);
      setNickname(session.user.user_metadata?.nickname || 'Builder');

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
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--black)',
        color: 'var(--muted)'
      }}>
        Loading dashboard…
      </div>
    );
  }

  const initials = (nickname || 'B').slice(0, 2).toUpperCase();

  const checklist = [
    { label: 'Add a short bio', done: !!profile?.bio, href: '/profile' },
    { label: 'List your skills', done: !!profile?.skills, href: '/profile' },
    { label: 'Post your first project', done: myProjects.length > 0, href: '/new-project' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const setupComplete = doneCount === checklist.length;

  return (
    <>
      <Head>
        <title>Dashboard · NEXUS-IT</title>
      </Head>

      <AppLayout nickname={nickname}>
        <div style={{ maxWidth: '960px' }}>

          {/* Profile Header */}
          <div className="dash-header" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--tea)',
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 600,
              flexShrink: 0
            }}>
              {initials}
            </div>

            <div className="dash-header-main" style={{ flex: 1, minWidth: '160px' }}>
              <h1 className="page-title">
                {nickname}
              </h1>
              <div className="dash-meta">
                {[
                  { label: 'Projects', value: myProjects.length },
                  { label: 'Followers', value: followerCount },
                  { label: 'Following', value: followingCount },
                  { label: 'Likes received', value: likesReceived },
                ].map((stat) => (
                  <span key={stat.label} className="dash-meta-item">
                    <strong>{stat.value}</strong> {stat.label}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="dash-header-edit"
              onClick={() => router.push('/profile')}
              style={{
                background: 'transparent',
                border: '1px solid var(--tea)',
                color: 'var(--tea)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Edit profile
            </button>
          </div>

          {/* Bio & Skills */}
          {(profile?.bio || profile?.skills) && (
            <div style={{ marginBottom: '28px' }}>
              {profile?.bio && (
                <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>
                  {profile.bio}
                </p>
              )}
              {profile?.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skills.split(',').map((s, i) => (
                    <span key={i} style={{
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      color: 'var(--muted)',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Setup checklist, shown until the profile is complete */}
          {!setupComplete && (
            <div className="side-card" style={{ marginBottom: '32px' }}>
              <h3><i className="ti ti-rocket"></i> Get set up</h3>
              <div className="dash-progress">
                <div
                  className="dash-progress-fill"
                  style={{ width: `${(doneCount / checklist.length) * 100}%` }}
                />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '0 0 6px' }}>
                {doneCount} of {checklist.length} complete
              </p>
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={`dash-checklist-item ${item.done ? 'done' : ''}`}
                  onClick={() => !item.done && router.push(item.href)}
                >
                  <span className="dash-check-circle"><i className="ti ti-check"></i></span>
                  <span className="dash-check-label">{item.label}</span>
                  {!item.done && <span className="dash-check-go">Do it →</span>}
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            <button
              onClick={() => router.push('/new-project')}
              style={{
                background: 'var(--tea)',
                color: '#1A1A1A',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + New project
            </button>
            <button
              onClick={() => router.push('/projects')}
              style={{
                background: 'transparent',
                border: '1px solid var(--tea)',
                color: 'var(--tea)',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Go to Home feed
            </button>
          </div>

          {/* Your Projects Section */}
          <h2 style={{
            fontFamily: "'Newsreader', serif",
            fontSize: '22px',
            color: 'var(--text)',
            marginBottom: '20px'
          }}>
            Your projects
          </h2>

          {myProjects.length === 0 ? (
            <div style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '56px 40px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '40px', color: 'var(--tea)', marginBottom: '16px' }}>
                <i className="ti ti-folder-plus"></i>
              </div>
              <h3 style={{
                fontFamily: "'Newsreader', serif",
                fontSize: '22px',
                color: 'var(--text)',
                marginBottom: '10px'
              }}>
                You haven’t posted a project yet
              </h3>
              <p style={{
                color: 'var(--muted)',
                fontSize: '15px',
                marginBottom: '24px',
                maxWidth: '340px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Share your work, get feedback, and grow your reputation in the community.
              </p>
              <button
                onClick={() => router.push('/new-project')}
                style={{
                  background: 'var(--tea)',
                  color: '#1A1A1A',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + Post your first project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/project/${p.id}`)}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'}
                >
                  <h3 style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: '0 0 6px 0'
                  }}>
                    {p.title}
                  </h3>
                  <p style={{
                    color: 'var(--muted)',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {p.description?.slice(0, 140)}{p.description?.length > 140 ? '…' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}