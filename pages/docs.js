import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';

const SECTIONS = [
  {
    icon: 'ti-rocket',
    title: 'Getting started',
    body: 'Create your account, add your skills and bio in Settings, then post your first project from the New project page.',
  },
  {
    icon: 'ti-folder',
    title: 'Projects',
    body: 'Showcase what you build with a description, tech stack, screenshots, GitHub and live demo links. Others can like it, leave feedback, and request to collaborate.',
  },
  {
    icon: 'ti-news',
    title: 'Posts',
    body: 'Share quick updates and thoughts with the community. Use #hashtags to make them easier to find, and attach images or short videos.',
  },
  {
    icon: 'ti-message',
    title: 'Messages',
    body: 'Message any builder from their profile or project page. You can edit or delete your own messages, share media, and block anyone who bothers you.',
  },
  {
    icon: 'ti-messages',
    title: 'Community forum',
    body: 'Ask questions or start discussions. Every post gets its own reply thread, so answers stay attached to the question.',
  },
  {
    icon: 'ti-sparkles',
    title: 'AI Advisor',
    body: 'Stuck on an idea, an architecture choice, or a bug? The advisor suggests project ideas and reviews your approach.',
  },
  {
    icon: 'ti-shield',
    title: 'Safety',
    body: 'Report content or block users from any project, profile, or conversation. Blocked users cannot message you.',
  },
];

export default function Docs() {
  const { loading } = useRequireAuth();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setNickname(session.user.user_metadata?.nickname || 'Builder');
    }
    load();
  }, []);

  if (loading) return <div className="dash-loading mono">Loading...</div>;

  return (
    <>
      <Head><title>Docs · NEXUS-IT</title></Head>
      <AppLayout nickname={nickname}>
        <div className="page-shell medium">
          <h1 className="page-title">Docs</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            A quick guide to everything on NEXUS-IT.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {SECTIONS.map((s) => (
              <div className="card" key={s.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <i className={`ti ${s.icon}`} style={{ color: 'var(--tea)', fontSize: '20px' }}></i>
                  <h3 style={{ fontSize: '17px', margin: 0 }}>{s.title}</h3>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
