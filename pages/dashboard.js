import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [topProject, setTopProject] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        router.replace('/');
        return;
      }
      setUser(session.user);
      const existingNickname = session.user.user_metadata?.nickname || '';
      setNickname(existingNickname);
      setNicknameInput(existingNickname);
      setLoading(false);
    }

    loadUser();
      async function loadTopProject() {
      const { data: projectsData } = await supabase.from('projects').select('*');
      const { data: likesData } = await supabase.from('project_likes').select('project_id');
      const { data: commentsData } = await supabase.from('comments').select('project_id');

      if (!projectsData || projectsData.length === 0) return;

      const likeCounts = {};
      (likesData || []).forEach((l) => { likeCounts[l.project_id] = (likeCounts[l.project_id] || 0) + 1; });
      const commentCounts = {};
      (commentsData || []).forEach((c) => { commentCounts[c.project_id] = (commentCounts[c.project_id] || 0) + 1; });

      const scored = projectsData.map((p) => ({
        ...p,
        likeCount: likeCounts[p.id] || 0,
        score: (likeCounts[p.id] || 0) + (commentCounts[p.id] || 0) * 2,
      }));

      scored.sort((a, b) => b.score - a.score);
      if (scored[0].score > 0) setTopProject(scored[0]);
    }
    loadTopProject();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSaveNickname() {
    const trimmed = nicknameInput.trim();
    if (!trimmed) return;

    setSaving(true);
    setSaveMsg('');
    const { data, error } = await supabase.auth.updateUser({
      data: { nickname: trimmed },
    });
    setSaving(false);

    if (error) {
      setSaveMsg(error.message);
      return;
    }
    setNickname(trimmed);
    setSaveMsg('Saved.');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  const builderPrompts = [
    "What are you shipping this week? Post it and get real feedback.",
    "Stuck on a bug? Ask the advisor before you rage-quit.",
    "Got a project idea? Drop it and see who wants to build it with you.",
    "Haven't posted in a while? Your next project could be someone else's inspiration.",
    "Who's working on something similar to you right now? Go find out.",
  ];

  function getTodaysPrompt() {
    const dayIndex = new Date().getDate() % builderPrompts.length;
    return builderPrompts[dayIndex];
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Still up? Respect.';
    if (hour < 12) return 'Rise and build.';
    if (hour < 17) return 'Mid-day momentum.';
    if (hour < 21) return 'Evening grind mode.';
    return 'Night owl hours.';
  }

  if (loading) {
    return <div className="dash-loading mono">Loading…</div>;
  }

  const displayName = nickname || user?.email;

  return (
    <>
      <Head>
        <title>Dashboard — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={displayName} />
        <div className="app-main">
          <div className="dash-content" style={{ padding: '40px 5vw', maxWidth: '760px' }}>
            <div className="eyebrow mono">// Signed in</div>
            <h1 style={{ margin: '14px 0 6px' }}>
              Welcome back, <span style={{ color: 'var(--tea)', fontStyle: 'italic' }}>{displayName}</span>
            </h1>
            <p className="sub">
              {nickname ? getGreeting() : 'Your nickname shows here instead of your email.'}
            </p>

            {(!nickname || editingNickname) ? (
              <div className="nickname-panel">
                <label className="field-label mono">Set your nickname</label>
                <div className="nickname-row">
                  <input
                    type="text"
                    placeholder="e.g. mahnoor.dev"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="mono"
                  />
                  <button
                    className="btn btn-solid"
                    onClick={() => {
                      handleSaveNickname();
                      setEditingNickname(false);
                    }}
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {saveMsg && <div className="field-hint">{saveMsg}</div>}
              </div>
            ) : (
              <div className="prompt-card">
                <div className="prompt-label">// today's prompt</div>
                <div className="prompt-text">{getTodaysPrompt()}</div>
                <span
                  className="nickname-edit-link"
                  onClick={() => {
                    setNicknameInput(nickname);
                    setEditingNickname(true);
                  }}
                >
                  change nickname
                </span>
              </div>
            )}

                        {topProject && (
              <div className="prompt-card" style={{ marginTop: '16px', borderColor: 'rgba(184,134,62,0.4)' }}>
                <span className="top-ranked-badge">🏆 Top ranked</span>
                <div
                  className="prompt-text"
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/project/${topProject.id}`)}
                >
                  {topProject.title}
                </div>
                <span className="project-meta" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  by {topProject.author_nickname} · {topProject.likeCount} likes
                </span>
              </div>
            )}
            <div className="quick-actions">
              <button className="btn btn-solid" onClick={() => router.push('/new-project')}>+ New project</button>
              <button className="btn" onClick={() => router.push('/projects')}>View projects</button>
              <button className="btn" onClick={() => router.push('/messages')}>Messages</button>
              <button className="btn" onClick={() => router.push('/forum')}>Forum</button>
              <button className="btn" onClick={() => router.push('/advisor')}>Ask the advisor</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}