import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import ReportBlockMenu from '../../components/ReportBlockMenu';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [media, setMedia] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [collabRequests, setCollabRequests] = useState([]);
  const [myRequestStatus, setMyRequestStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');
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

      const { data: mediaData } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });
      setMedia(mediaData || []);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });
      if (!commentsError) setComments(commentsData);

      const { data: likesData } = await supabase
        .from('project_likes')
        .select('user_id')
        .eq('project_id', id);
      setLikeCount((likesData || []).length);
      if (session) setLiked((likesData || []).some((l) => l.user_id === session.user.id));

      const { data: collabData } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      setCollabRequests(collabData || []);
      if (session) {
        const mine = (collabData || []).find((r) => r.requester_id === session.user.id);
        if (mine) setMyRequestStatus(mine.status);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  async function handleLike() {
    if (!currentUserId) { router.push('/'); return; }
    if (liked) {
      await supabase.from('project_likes').delete().eq('project_id', id).eq('user_id', currentUserId);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from('project_likes').insert({ project_id: id, user_id: currentUserId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  async function handlePostComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (!currentUserId) { router.push('/'); return; }

    setPosting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ project_id: id, user_id: currentUserId, author_nickname: nickname, content: trimmed })
      .select()
      .single();
    setPosting(false);

    if (error) { setError(error.message); return; }
    setComments([...comments, data]);
    setCommentText('');
  }

  async function handleDeleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) setComments(comments.filter((c) => c.id !== commentId));
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm('Delete this project? This cannot be undone.');
    if (!confirmed) return;
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    setDeleting(false);
    if (error) { setError(error.message); return; }
    router.push('/projects');
  }

  async function handleRequestCollab() {
    if (!currentUserId) { router.push('/'); return; }
    setRequesting(true);
    const { data, error } = await supabase
      .from('collaboration_requests')
      .insert({ project_id: id, requester_id: currentUserId, requester_nickname: nickname })
      .select()
      .single();
    setRequesting(false);

    if (!error) {
      setCollabRequests([...collabRequests, data]);
      setMyRequestStatus('pending');
    }
  }

  async function handleUpdateRequest(requestId, status) {
    const { error } = await supabase
      .from('collaboration_requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      setCollabRequests(collabRequests.map((r) => r.id === requestId ? { ...r, status } : r));
    }
  }

  if (loading) return <div className="dash-loading mono">Loading…</div>;
  if (error || !project) return <div className="dash-loading mono">{error || 'Project not found.'}</div>;

  const isOwner = project.user_id === currentUserId;
  const approvedCollabs = collabRequests.filter((r) => r.status === 'approved');
  const pendingCollabs = collabRequests.filter((r) => r.status === 'pending');

  return (
    <>
      <Head>
        <title>{project.title} — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="project-detail page-shell medium">
            <div className="project-detail-top">
              <h1>{project.title}</h1>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="project-author"
                    onClick={() => router.push(`/user/${project.user_id}`)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    by {project.author_nickname}
                  </span>
                  <ReportBlockMenu
                    targetUserId={project.user_id}
                    contentType="project"
                    contentId={project.id}
                    currentUserId={currentUserId}
                  />
                </div>
                {isOwner ? (
                  <button className="comment-delete" onClick={handleDeleteProject} disabled={deleting}>
                    {deleting ? 'deleting…' : 'delete project'}
                  </button>
                ) : (
                  currentUserId && (
                    <button
                      className="btn"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => router.push(`/messages/${project.user_id}?nickname=${encodeURIComponent(project.author_nickname)}`)}
                    >
                      Message {project.author_nickname}
                    </button>
                  )
                )}
              </div>
            </div>

            {media.length > 0 && (
              <div className="media-gallery">
                {media.map((m) => (
                  <div className="media-gallery-item" key={m.id}>
                    {m.media_type === 'video' ? (
                      <video src={m.media_url} controls />
                    ) : (
                      <img src={m.media_url} alt={project.title} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="project-desc">{project.description}</p>

            {project.tech_stack && (
              <div className="project-tags">
                {project.tech_stack.split(',').map((tag, i) => (
                  <span className="project-tag" key={i}>{tag.trim()}</span>
                ))}
              </div>
            )}

            <div className="project-card-footer" style={{ marginBottom: '10px' }}>
              <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                <i className="ti ti-heart"></i> {likeCount}
              </button>
            </div>

            <div className="project-links">
              {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer">GitHub →</a>}
              {project.demo_url && <a href={project.demo_url} target="_blank" rel="noreferrer">Live demo →</a>}
            </div>

            <div className="collab-section">
              <h3>Collaborators {approvedCollabs.length > 0 && `(${approvedCollabs.length})`}</h3>

              {approvedCollabs.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {approvedCollabs.map((c) => (
                    <div key={c.id} className="collab-request-row">
                      <span>{c.requester_nickname}</span>
                      <span className="collab-badge approved">Collaborator</span>
                    </div>
                  ))}
                </div>
              )}

              {isOwner && pendingCollabs.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {pendingCollabs.map((c) => (
                    <div key={c.id} className="collab-request-row">
                      <span>{c.requester_nickname} wants to join</span>
                      <div className="collab-actions">
                        <button className="btn btn-solid" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => handleUpdateRequest(c.id, 'approved')}>Approve</button>
                        <button className="btn" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => handleUpdateRequest(c.id, 'declined')}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isOwner && currentUserId && (
                myRequestStatus === 'pending' ? (
                  <span className="collab-badge pending">Request pending</span>
                ) : myRequestStatus === 'approved' ? (
                  <span className="collab-badge approved">You're a collaborator</span>
                ) : myRequestStatus === 'declined' ? (
                  <span className="collab-badge pending">Request declined</span>
                ) : (
                  <button className="btn" onClick={handleRequestCollab} disabled={requesting}>
                    {requesting ? 'Requesting…' : 'Request to join'}
                  </button>
                )
              )}
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
                        <span
                          className="comment-author"
                          onClick={() => router.push(`/user/${c.user_id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {c.author_nickname}
                        </span>
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
      </div>
    </>
  );
}