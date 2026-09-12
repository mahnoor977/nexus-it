import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import AppLayout from '../components/AppLayout';
import { useRequireAuth } from '../hooks/useRequireAuth';

export default function TechStack() {
  const { loading: authLoading } = useRequireAuth();

  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setNickname(session.user.user_metadata?.nickname || 'Anonymous Builder');

      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const tagCounts = {};
  projects.forEach((p) => {
    if (!p.tech_stack) return;
    p.tech_stack.split(',').forEach((t) => {
      const tag = t.trim();
      if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const filteredProjects = activeTag
    ? projects.filter((p) => p.tech_stack && p.tech_stack.split(',').map((t) => t.trim()).includes(activeTag))
    : [];

  if (authLoading) return <div className="dash-loading mono">Loading...</div>;

  return (
    <>
      <Head><title>Tech Stack — NEXUS-IT</title></Head>
      <AppLayout nickname={nickname}>
        <div className="page-shell wide">
          <h1 className="page-title">Tech Stack</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            Browse projects by technology across the whole platform.
          </p>

          {loading ? (
            <div className="projects-empty">Loading…</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                {sortedTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={activeTag === tag ? 'btn btn-solid' : 'btn'}
                    style={{ fontSize: '12.5px' }}
                  >
                    {tag} <span style={{ opacity: 0.7 }}>({count})</span>
                  </button>
                ))}
              </div>

              {activeTag && (
                <>
                  <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>Projects using {activeTag}</h2>
                  {filteredProjects.length === 0 ? (
                    <div className="projects-empty">No projects found.</div>
                  ) : (
                    <div className="projects-list">
                      {filteredProjects.map((p) => (
                        <div
                          className="project-card project-card-link"
                          key={p.id}
                          onClick={() => router.push(`/project/${p.id}`)}
                        >
                          <div className="project-card-top">
                            <h3>{p.title}</h3>
                            <span className="project-author">by {p.author_nickname}</span>
                          </div>
                          <p className="project-desc">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!activeTag && (
                <div className="projects-empty">Click a technology above to see projects using it.</div>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </>
  );
}