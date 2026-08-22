import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import MobileMenu from '../../components/MobileMenu';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        setNickname(session.user.user_metadata?.nickname || session.user.email);
      }

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        setError(projectError.message);
        setLoading(false);
        return;
      }
      setProject(projectData);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (!commentsError) setComments(commentsData);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  async function handlePostComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    if (!currentUserId) {
      router.push('/');
      return;
    }

    setPosting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: id,
        user_id: currentUserId,
        author_nickname: nickname,
        content: trimmed,
      })
      .select()
      .single();

    setPosting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setComments([...comments, data]);
    setCommentText('');
  }

  async function handleDeleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  if (error || !project) {
    return (
      <div className="dash-loading mono">
        {error || 'Project not found.'}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.title} — NEXUS-IT</title>
      </Head>
      <div className="project-detail-page">
        <nav>
          <div className="logo">
            <MobileMenu links={[
              { label: 'Dashboard', onClick: () => router.push('/dashboard') },
              { label: 'Projects', onClick: () => router.push('/projects') },
              { label: '+ New project', onClick: () => router.push('/new-project') },
              { label: 'Log out', onClick: handleLogout },
            ]} />
            <span>NEXUS-IT</span>
          </div>
          <div className="nav-links">
            <button className="btn" onClick={() => router.push('/projects')}>Back to projects</button>
          </div>
        </nav>

        <div className="project-detail">
          <div className="project-detail-top">
            <h1>{project.title}</h1>
            <span className="project-author">by {project.author_nickname}</span>
          </div>

          <p className="project-desc">{project.description}</p>

          {project.tech_stack && (
            <div className="project-tags">
              {project.tech_stack.split(',').map((tag, i) => (
                <span className="project-tag" key={i}>{tag.trim()}</span>
              ))}
            </div>
          )}

          <div className="project-links">
            {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer">GitHub →</a>}
            {project.demo_url && <a href={project.demo_url} target="_blank" rel="noreferrer">Live demo →</a>}
          </div>

          <div className="comments-section">
            <h2>Feedback ({comments.length})</h2>

            <div className="comment-form">
              <input
                type="text"
                placeholder={currentUserId ? "Leave feedback..." : "Log in to leave feedback"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                disabled={!currentUserId || posting}
              />
              <button onClick={handlePostComment} disabled={!currentUserId || posting || !commentText.trim()}>
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>

            {comments.length === 0 ? (
              <div className="comments-empty">No feedback yet — be the first to comment.</div>
            ) : (
              <div className="comment-list">
                {comments.map((c) => (
                  <div className="comment-item" key={c.id}>
                    <div className="comment-item-top">
                      <span className="comment-author">{c.author_nickname}</span>
                      {c.user_id === currentUserId && (
                        <button className="comment-delete" onClick={() => handleDeleteComment(c.id)}>
                          delete
                        </button>
                      )}
                    </div>
                    <div className="comment-content">{c.content}</div>
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