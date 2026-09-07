import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function Projects() {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('recent');

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

  // Filter projects based on active tab
  let visibleProjects = [...allProjects];

  if (activeTab === 'trending') {
    visibleProjects = [...allProjects].sort((a, b) => b.score - a.score);
  } else if (activeTab === 'following') {
    visibleProjects = allProjects.filter((p) => followingIds.has(p.user_id));
  }

  return (
    <>
      <Head>
        <title>Projects · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '1100px' }}>
          
          {/* Header */}
          <h1 style={{ 
            fontFamily: "'Newsreader', serif", 
            fontSize: '36px', 
            color: '#1A1A1A',
            marginBottom: '8px' 
          }}>
            Projects
          </h1>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '28px', 
            marginBottom: '36px',
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

          {/* Error */}
          {error && (
            <div style={{ color: '#c0392b', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ color: '#6B6558', padding: '40px 0' }}>
              Loading projects...
            </div>
          )}

          {/* Empty State */}
          {!loading && visibleProjects.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="ti ti-folder-off" style={{ fontSize: '42px' }}></i>
              </div>
              <h3>No projects yet</h3>
              <p>
                {activeTab === 'following'
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

          {/* Projects List */}
          {!loading && visibleProjects.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {visibleProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/project/${p.id}`)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E0D8',
                    borderRadius: '14px',
                    padding: '24px 28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                    transition: 'box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.03)'}
                >
                  {/* Top ranked badge */}
                  {p.isTop && (
                    <span style={{
                      display: 'inline-block',
                      background: '#F5E9C8',
                      color: '#8B6914',
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      marginBottom: '12px'
                    }}>
                      Top ranked
                    </span>
                  )}

                  {/* Title + Author */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 600, 
                      color: '#1A1A1A',
                      margin: 0 
                    }}>
                      {p.title}
                    </h3>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/user/${p.user_id}`);
                      }}
                      style={{ 
                        color: '#C5A059', 
                        fontSize: '14px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        marginLeft: '16px'
                      }}
                    >
                      by {p.author_nickname || 'Builder'}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ 
                    color: '#6B6558', 
                    fontSize: '15px', 
                    lineHeight: 1.6,
                    marginBottom: '16px' 
                  }}>
                    {p.description}
                  </p>

                  {/* Tech tags */}
                  {p.tech_stack && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                      {p.tech_stack.split(',').map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#F7F4EE',
                            color: '#6B6558',
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E5E0D8'
                          }}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    borderTop: '1px solid #F0EBE3',
                    paddingTop: '14px'
                  }}>
                    <button
                      onClick={(e) => handleLike(e, p.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: likedIds.has(p.id) ? '#C5A059' : '#6B6558',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <i className={`ti ${likedIds.has(p.id) ? 'ti-heart-filled' : 'ti-heart'}`}></i>
                      {p.likeCount}
                    </button>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B6558', fontSize: '14px' }}>
                      <i className="ti ti-message-circle"></i>
                      {p.commentCount}
                    </span>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#C5A059', fontSize: '14px', textDecoration: 'none' }}
                        >
                          GitHub →
                        </a>
                      )}
                      {p.demo_url && (
                        <a
                          href={p.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#C5A059', fontSize: '14px', textDecoration: 'none' }}
                        >
                          Live demo →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}