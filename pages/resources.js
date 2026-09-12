import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';

const RESOURCES = [
  {
    category: 'Web Development', links: [
      { title: 'The Odin Project', url: 'https://www.theodinproject.com' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    ]
  },
  {
    category: 'AI & Machine Learning', links: [
      { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai' },
      { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
    ]
  },
  {
    category: 'Computer Science Fundamentals', links: [
      { title: 'CS50 by Harvard', url: 'https://cs50.harvard.edu' },
      { title: 'NeetCode (Data Structures & Algorithms)', url: 'https://neetcode.io' },
    ]
  },
];

export default function Resources() {
  const { loading } = useRequireAuth();
  const [nickname, setNickname] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');
    }
    load();
  }, []);

  if (loading) return <div className="dash-loading mono">Loading...</div>;

  return (
    <>
      <Head><title>Resources — NEXUS-IT</title></Head>
      <AppLayout nickname={nickname}>
        <div className="page-shell medium">
          <h1 className="page-title">Resources</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            Curated learning resources, picked by the community.
          </p>
          <div className="faq-section" style={{ padding: 0 }}>
            {RESOURCES.map((cat, i) => (
              <div
                key={i}
                className={`faq-item ${openIndex === i ? 'open' : ''}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="faq-question">{cat.category} <span className="faq-icon">+</span></div>
                <div className="faq-answer">
                  {cat.links.map((link, j) => (
                    <div key={j} style={{ marginBottom: '6px' }}>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--tea)' }}>{link.title} →</a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}