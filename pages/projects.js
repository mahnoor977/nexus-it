import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setNickname(session.user.user_metadata?.nickname || session.user.email);
        setCurrentUserId(session.user.id);
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

      withScores.sort((a, b) => b.score - a.score);
      const topId = withScores.length > 0 && withScores[0].score > 0 ? withScores[0].id : null;

      withScores.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setProjects(withScores.map((p) => ({ ...p, isTop: p.id === topId })));
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
      setProjects(projects.map((p) => p.id === projectId ? { ...p, likeCount: p.likeCount - 1 } : p));
    } else {
      await supabase.from('project_likes').insert({ project_id: projectId, user_id: currentUserId });
      const newLiked = new Set(likedIds);
      newLiked.add(projectId);
      setLikedIds(newLiked);
      setProjects(projects.map((p) => p.id === projectId ? { ...p, likeCount: p.likeCount + 1 } : p));
    }
  }

  return (
    <>
      <Head>
        <title>Projects — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div style={{ padding: '40px 5vw', maxWidth: '1040px' }}>
            <div className="projects-header" style={{ margin: '0 0 40px' }}>
              <h1>Projects</h1>
            </div>

            {loading && <div className="projects-empty">Loading projects…</div>}
            {error && <div className="projects-empty">Couldn't load projects: {error}</div>}

            {!loading && !error && projects.length === 0 && (
              <div className="projects-empty">
                No projects yet — be the first to post one.
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="projects-list">
                {projects.map((p) => (
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