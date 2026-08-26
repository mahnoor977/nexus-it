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