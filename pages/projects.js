import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import { useRequireAuth } from '../hooks/useRequireAuth';

export default function Projects() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');
        setCurrentUserId(session.user.id);

        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id);
        setFollowingIds(new Set((followingData || []).map((f) => f.following_id)));
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        setError(projectsError.message);
        setLoading(false);
        return;
      }

      const { data: likesData } = await supabase
        .from('project_likes')
        .select('project_id, user_id');

      const likeCounts = {};
      const myLikes = new Set();
      (likesData || []).forEach((l) => {
        likeCounts[l.project_id] = (likeCounts[l.project_id] || 0) + 1;
        if (session && l.user_id === session.user.id) myLikes.add(l.project_id);
      });

      const { data: commentsData } = await supabase
        .from('comments')
        .select('project_id');

      const commentCounts = {};
      (commentsData || []).forEach((c) => {
        commentCounts[c.project_id] = (commentCounts[c.project_id] || 0) + 1;
      });

      const withScores = (projectsData || []).map((p) => ({
        ...p,
        likeCount: likeCounts[p.id] || 0,
        commentCount: commentCounts[p.id] || 0,
        score: (likeCounts[p.id] || 0) + (commentCounts[p.id] || 0) * 2,
      }));

      const scoredCopy = [...withScores].sort((a, b) => b.score - a.score);
      const topId = scoredCopy.length > 0 && scoredCopy[0].score > 0 ? scoredCopy[0].id : null;

      setAllProjects(withScores.map((p) => ({ ...p, isTop: p.id === topId })));
      setLikedIds(myLikes);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLike(e, projectId) {
    e.stopPropagation();
    if (!currentUserId) {
      router.push('/');
      return;
    }

    const isLiked = likedIds.has(projectId);

    if (isLiked) {
      await supabase.from('project_likes').delete().eq('project_id', projectId).eq('user_id', currentUserId);
      const newLiked = new Set(likedIds);
      newLiked.delete(projectId);
      setLikedIds(newLiked);
      setAllProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, likeCount: p.likeCount - 1 } : p))
      );
    } else {
      await supabase.from('project_likes').insert({ project_id: projectId, user_id: currentUserId });
      const newLiked = new Set(likedIds);
      newLiked.add(projectId);
      setLikedIds(newLiked);
      setAllProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, likeCount: p.likeCount + 1 } : p))
      );
    }
  }

  let visibleProjects = [...allProjects];

  if (activeTab === 'trending') {
    visibleProjects = [...allProjects].sort((a, b) => b.score - a.score);
  } else if (activeTab === 'following') {
    visibleProjects = allProjects.filter((p) => followingIds.has(p.user_id));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    visibleProjects = visibleProjects.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.tech_stack || '').toLowerCase().includes(q)
    );
  }

  const tagColors = ['#C5A059', '#8CA88C', '#B08CA8', '#8CA0C4', '#C48C8C'];

  if (authLoading) return <div className="dash-loading mono">Loading...</div>;

  return (
    <>
      <Head>
        <title>Projects · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '1200px' }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '18px'
          }}>
            <h1 style={{
              fontFamily: "'Newsreader', serif",
              fontSize: '38px',
              color: '#1A1A1A',
              margin: 0
            }}>
              Projects
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px', maxWidth: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '10px',
                padding: '10px 14px',
                flex: 1,
                minWidth: '0'
              }}>
                <i className="ti ti-search" style={{ color: '#6B6558', fontSize: '15px' }}></i>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '14px',
                    color: '#1A1A1A',
                    flex: 1
                  }}
                />
                <span style={{
                  fontSize: '11px',
                  color: '#9C9482',
                  border: '1px solid #E5E0D8',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  fontFamily: "'IBM Plex Mono', monospace"
                }}>
                  ⌘K
                </span>
              </div>

              <button
                title="Filters (coming soon)"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #E5E0D8',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <i className="ti ti-adjustments-horizontal" style={{ color: '#6B6558', fontSize: '17px' }}></i>
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '28px',
            marginBottom: '32px',
            borderBottom: '1px solid #E5E0D8',
            paddingBottom: '12px'
          }}>
            {['recent', 'trending', 'following'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#C5A059' : '#6B6558',
                  cursor: 'pointer',
                  paddingBottom: '10px',
                  borderBottom: activeTab === tab ? '2px solid #C5A059' : '2px solid transparent',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ color: '#c0392b', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ color: '#6B6558', padding: '40px 0' }}>
              Loading projects...
            </div>
          )}

          {!loading && visibleProjects.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="ti ti-folder-off" style={{ fontSize: '42px' }}></i>
              </div>
              <h3>No projects yet</h3>
              <p>
                {searchQuery.trim()
                  ? 'No projects match your search.'
                  : activeTab === 'following'
                  ? "People you follow haven't posted any projects yet."
                  : "Be the first to share what you're building."}
              </p>
              <button
                className="btn-primary"
                onClick={() => router.push('/new-project')}
              >
                + Post a project
              </button>
            </div>
          )}

          {!loading && visibleProjects.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {visibleProjects.map((p) => {
                const tags = p.tech_stack
                  ? p.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
                  : [];
                const initials = (p.author_nickname || 'B').slice(0, 2).toUpperCase();

                return (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/project/${p.id}`)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E0D8',
                      borderRadius: '16px',
                      padding: '22px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                      transition: 'box-shadow 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.03)'}
                  >
                    {p.isTop && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        alignSelf: 'flex-start',
                        background: '#F5E9C8',
                        color: '#8B6914',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        marginBottom: '14px'
                      }}>
                        <i className="ti ti-crown" style={{ fontSize: '12px' }}></i>
                        Top ranked
                      </span>
                    )}

                    <h3 style={{
                      fontSize: '19px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      margin: '0 0 8px',
                      lineHeight: 1.3
                    }}>
                      {p.title}
                    </h3>

                    <p style={{
                      color: '#6B6558',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {p.description}
                    </p>

                    {tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#F7F4EE',
                              color: '#4A453A',
                              fontSize: '12px',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              border: '1px solid #E5E0D8'
                            }}
                          >
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: tagColors[i % tagColors.length]
                            }} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#C5A059',
                        color: '#1A1A1A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '11px',
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/user/${p.user_id}`);
                        }}
                        style={{ color: '#4A453A', fontSize: '13.5px', cursor: 'pointer' }}
                      >
                        by {p.author_nickname || 'Builder'}
                      </span>

                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '14px' }}>
                        <button
                          onClick={(e) => handleLike(e, p.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: likedIds.has(p.id) ? '#C5A059' : '#6B6558',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: 0
                          }}
                        >
                          <i className={`ti ${likedIds.has(p.id) ? 'ti-heart-filled' : 'ti-heart'}`}></i>
                          {p.likeCount}
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B6558', fontSize: '13px' }}>
                          <i className="ti ti-message-circle"></i>
                          {p.commentCount}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      {p.github_url ? (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: '1px solid #E5E0D8',
                            borderRadius: '10px',
                            padding: '10px',
                            fontSize: '13px',
                            color: '#1A1A1A',
                            textDecoration: 'none',
                            fontWeight: 500
                          }}
                        >
                          <i className="ti ti-brand-github"></i>
                          GitHub
                        </a>
                      ) : (
                        <span style={{ flex: 1 }} />
                      )}
                      {p.demo_url && (
                        <a
                          href={p.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#C5A059',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px',
                            fontSize: '13px',
                            color: '#1A1A1A',
                            textDecoration: 'none',
                            fontWeight: 500
                          }}
                        >
                          Live demo
                          <i className="ti ti-external-link"></i>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}