import { useState } from 'react';
import Head from 'next/head';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useRequireAuth } from '../hooks/useRequireAuth';

const DOCS = [
  { q: 'How do I post a project?', a: 'Click the "+ New project" icon in the sidebar. Add a title, description, tech stack, and optionally attach screenshots or videos and links to your GitHub/live demo.' },
  { q: 'How does the AI Advisor work?', a: 'The Advisor is a chat assistant that can suggest project ideas, review your approach, or help you get unstuck. Just ask it anything from the Advisor page.' },
  { q: 'How do likes and ranking work?', a: 'Projects earn points from likes and comments. The highest-scoring project each period gets featured as "Top ranked" on the dashboard and feed.' },
  { q: 'How do I message someone?', a: 'Visit their profile or project page and click "Message." You can control who can message you from Settings.' },
  { q: 'How does collaboration work?', a: 'On someone else\'s project, click "Request to join." The project owner can approve or decline your request from their project page.' },
  { q: 'How do I report or block someone?', a: 'Click the "···" menu next to any profile, project, or post to report content or block a user.' },
];

export default function Docs() {
  const { loading } = useRequireAuth();
  if (loading) return <div className="dash-loading mono">Loading...</div>;
  const [nickname, setNickname] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');
    }
    load();
  }, []);

  return (
    <>
      <Head><title>Docs — NEXUS-IT</title></Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <Topbar nickname={nickname} />
          <div className="page-shell medium">
            <h1 style={{ marginBottom: '10px' }}>Docs</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
              How to use NEXUS-IT.
            </p>
            <div className="faq-section" style={{ padding: 0 }}>
              {DOCS.map((item, i) => (
                <div
                  key={i}
                  className={`faq-item ${openIndex === i ? 'open' : ''}`}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="faq-question">{item.q} <span className="faq-icon">+</span></div>
                  <div className="faq-answer">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}