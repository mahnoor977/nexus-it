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
        setNickname(session.user.user_metadata?.nickname || session.user.email);
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

      const withScores = projectsData.map((p) => ({
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
      setAllProjects(allProjects.map((p) => p.id === projectId ? { ...p, likeCount: p.likeCount - 1 } : p));
    } else {
      await supabase.from('project_likes').insert({ project_id: projectId, user_id: currentUserId });
      const newLiked = new Set(likedIds);
      newLiked.add(projectId);
      setLikedIds(newLiked);
      setAllProjects(allProjects.map((p) => p.id === projectId ? { ...p, likeCount: p.likeCount + 1 } : p));
    }
  }

  let visibleProjects = allProjects;
  if (activeTab === 'trending') {
    visibleProjects = [...allProjects].sort((a, b) => b.score - a.score);
  } else if (activeTab === 'following') {
    visibleProjects = allProjects.filter((p) => followingIds.has(p.user_id));
  }

  return (
    <>
      <Head>
        <title>Projects — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="page-shell wide">
            <div className="projects-header" style={{ margin: '0 0 24px' }}>
              <h1>Projects</h1>
            </div>

            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--line)', marginBottom: '24px' }}>
              {['recent', 'trending', 'following'].map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontSize: '13px', cursor: 'pointer', paddingBottom: '10px', textTransform: 'capitalize',
                    color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                    fontWeight: activeTab === tab ? 500 : 400,
                    borderBottom: activeTab === tab ? '2px solid var(--tea)' : '2px solid transparent',
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>

            {loading && <div className="projects-empty">Loading projects…</div>}
            {error && <div className="projects-empty">Couldn't load projects: {error}</div>}

            {!loading && !error && visibleProjects.length === 0 && (
              <div className="projects-empty">
                {activeTab === 'following'
                  ? "You're not following anyone with projects yet — follow builders from their profile."
                  : "No projects yet — be the first to post one."}
              </div>
            )}

            {!loading && visibleProjects.length > 0 && (
              <div className="projects-list">
                {visibleProjects.map((p) => (
                  <div
                    className="project-card project-card-link"
                    key={p.id}
                    onClick={() => router.push(`/project/${p.id}`)}
                  >
                    {p.isTop && <span className="top-ranked-badge">Top ranked</span>}
                    <div className="project-card-top">
                      <h3>{p.title}</h3>
                      <span
                        className="project-author"
                        onClick={(e) => { e.stopPropagation(); router.push(`/user/${p.user_id}`); }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        by {p.author_nickname}
                      </span>
                    </div>
                    <p className="project-desc">{p.description}</p>
                    {p.tech_stack && (
                      <div className="project-tags">
                        {p.tech_stack.split(',').map((tag, i) => (
                          <span className="project-tag" key={i}>{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-card-footer">
                      <button
                        className={`like-btn ${likedIds.has(p.id) ? 'liked' : ''}`}
                        onClick={(e) => handleLike(e, p.id)}
                      >
                        <i className="ti ti-heart"></i> {p.likeCount}
                      </button>
                      <span className="like-btn" style={{ cursor: 'default' }}>
                        <i className="ti ti-message-circle"></i> {p.commentCount}
                      </span>
                      <div className="project-links" style={{ marginLeft: 'auto' }}>
                        {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>GitHub →</a>}
                        {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Live demo →</a>}
                      </div>
                    </div>
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