import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);

  // ---------- Auth ----------
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

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

  // ---------- Network canvas background (same as landing page) ----------
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [];
    let rafId;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);

    function initNodes() {
      nodes = [];
      const count = Math.max(28, Math.floor((W * H) / 38000));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 1,
        });
      }
    }

    const mouse = { x: -9999, y: -9999 };
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const opacity = (1 - dist / 140) * 0.35;
            ctx.strokeStyle = `rgba(207,225,180,${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dxm = nodes[i].x - mouse.x, dym = nodes[i].y - mouse.y;
        const dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 160) {
          ctx.strokeStyle = `rgba(227,240,196,${(1 - dm / 160) * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(207,225,180,0.75)';
        ctx.fill();
      });
      if (!prefersReduced) rafId = requestAnimationFrame(draw);
    }

    resize();
    initNodes();
    draw();
    if (prefersReduced) draw();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [loading]);

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
    return (
      <div className="dash-loading mono">Loading…</div>
    );
  }

  const displayName = nickname || user?.email;

  return (
    <>
      <Head>
        <title>Dashboard — NEXUS-IT</title>
      </Head>

      <nav>
        <div className="logo">
          <button className="hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
          <span>NEXUS-IT</span>
        </div>
        <div className="nav-links">
          <button className="btn" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <section className="hero dash-hero">
        <canvas id="network-canvas" ref={canvasRef}></canvas>
        <div className="hero-content dash-content">
          <div className="eyebrow mono">// SIGNED IN</div>
          <h1 className="dash-welcome">Welcome back, <span>{displayName}</span></h1>
          <p className="sub">
            {nickname
              ? getGreeting()
              : "Your nickname shows here instead of your email."}
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
        </div>
      </section>

      {/* Floating AI advisor button — bottom right */}
      <button className="fab fab-ai" aria-label="AI Advisor" onClick={() => router.push('/advisor')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z" fill="currentColor" />
        </svg>
      </button>

      {/* N logo button — bottom left, opposite side, same pulse style */}
      <button className="fab fab-brand" aria-label="NEXUS-IT" onClick={() => router.push('/dashboard')}>
        <span className="mono">N</span>
      </button>
    </>
  );
}