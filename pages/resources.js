import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';

const RESOURCES = [
  { icon: 'ti-world', category: 'Web Development', links: [
    { title: 'The Odin Project', url: 'https://www.theodinproject.com' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { title: 'web.dev by Google', url: 'https://web.dev' },
  ]},
  { icon: 'ti-brain', category: 'AI & Machine Learning', links: [
    { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai' },
    { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
    { title: 'Hugging Face Learn', url: 'https://huggingface.co/learn' },
  ]},
  { icon: 'ti-binary-tree', category: 'CS Fundamentals & DSA', links: [
    { title: 'CS50 by Harvard', url: 'https://cs50.harvard.edu' },
    { title: 'NeetCode (Data Structures & Algorithms)', url: 'https://neetcode.io' },
    { title: 'Open Source Society University', url: 'https://github.com/ossu/computer-science' },
  ]},
  { icon: 'ti-cloud', category: 'DevOps & Cloud', links: [
    { title: 'Docker: Getting Started', url: 'https://docs.docker.com/get-started/' },
    { title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
    { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws' },
  ]},
  { icon: 'ti-database', category: 'Databases & Backend', links: [
    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com' },
    { title: 'Supabase Docs', url: 'https://supabase.com/docs' },
    { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
  ]},
  { icon: 'ti-device-mobile', category: 'Mobile Development', links: [
    { title: 'React Native Docs', url: 'https://reactnative.dev/docs/getting-started' },
    { title: 'Flutter Codelabs', url: 'https://docs.flutter.dev/codelabs' },
  ]},
  { icon: 'ti-palette', category: 'Design & UI/UX', links: [
    { title: 'Refactoring UI', url: 'https://www.refactoringui.com' },
    { title: 'Laws of UX', url: 'https://lawsofux.com' },
  ]},
  { icon: 'ti-git-branch', category: 'Git & Open Source', links: [
    { title: 'Pro Git (free book)', url: 'https://git-scm.com/book' },
    { title: 'First Contributions', url: 'https://github.com/firstcontributions/first-contributions' },
  ]},
];

export default function Resources() {
  const { loading } = useRequireAuth();
  const [nickname, setNickname] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

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
      <Head><title>Resources · NEXUS-IT</title></Head>
      <AppLayout nickname={nickname}>
          <div className="page-shell medium">
            <h1 className="page-title">Resources</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
              Curated learning resources, picked by the community. Free unless noted.
            </p>
            <div className="faq-section" style={{ padding: 0 }}>
              {RESOURCES.map((cat, i) => (
                <div
                  key={i}
                  className={`faq-item ${openIndex === i ? 'open' : ''}`}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="faq-question">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`ti ${cat.icon}`} style={{ color: 'var(--tea)', fontSize: '18px' }}></i>
                      {cat.category}
                      <span style={{ color: 'var(--muted)', fontSize: '12px' }}>({cat.links.length})</span>
                    </span>
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    {cat.links.map((link, j) => (
                      <div key={j} style={{ marginBottom: '6px' }}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--tea)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link.title} →
                        </a>
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
