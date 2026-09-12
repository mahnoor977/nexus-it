import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';

const SECTIONS = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is NEXUS-IT?',
        a: 'A place to post what you\'re building, find people to build with, and get feedback from other builders.',
      },
      {
        q: 'How do I set up my profile?',
        a: 'Go to Settings from the sidebar to add your nickname, bio, and skills. A complete profile shows up better in People search.',
      },
    ],
  },
  {
    title: 'Projects',
    items: [
      {
        q: 'How do I post a project?',
        a: 'Click the + icon in the top navbar, or "New project" in the sidebar. Add a title, description, tech stack, and an optional live link.',
      },
      {
        q: 'Can I edit or delete a project after posting?',
        a: 'Yes — open the project from your Dashboard and use the edit/delete options there.',
      },
    ],
  },
  {
    title: 'AI Advisor',
    items: [
      {
        q: 'What can the Advisor help with?',
        a: 'Ask it for project ideas, feedback on your approach, or help getting unstuck on something you\'re building.',
      },
      {
        q: 'Does it remember past conversations?',
        a: 'Each conversation in the Advisor is independent for now — start a new one anytime from the sidebar.',
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        q: 'What is the Forum for?',
        a: 'Longer-form discussions, questions, and ideas — things that don\'t fit neatly into a single project.',
      },
      {
        q: 'What are the community guidelines?',
        a: 'Be respectful, give constructive feedback, and don\'t post spam or unrelated promotions. Reports are reviewed by moderators.',
      },
    ],
  },
];

export default function Docs() {
  const { loading: authLoading } = useRequireAuth();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');
    }
    load();
  }, []);

  if (authLoading) return <div className="dash-loading mono">Loading...</div>;

  return (
    <>
      <Head>
        <title>Docs · NEXUS-IT</title>
      </Head>

      <AppLayout nickname={nickname}>
        <div className="page-shell medium">
          <h1 className="page-title">Docs</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            Everything you need to know about using NEXUS-IT.
          </p>

          <div className="faq-section" style={{ padding: 0 }}>
            {SECTIONS.map((section) => (
              <div key={section.title} style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px',
                  fontFamily: "'IBM Plex Sans', sans-serif"
                }}>
                  {section.title}
                </h3>

                {section.items.map((item) => (
                  <div
                    key={item.q}
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
                      {item.q}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}