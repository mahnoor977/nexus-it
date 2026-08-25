import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProjects(data);
      }
      setLoading(false);
    }
    loadProjects();

    async function loadNickname() {
      const { data: { session } } = await supabase.auth.getSession();
      setNickname(session?.user?.user_metadata?.nickname || '');
    }
    loadNickname();
  }, []);

  return (
    <>
      <Head>
        <title>Projects — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />

        <main className="app-main">
          <div className="projects-page">
            <div className="projects-header">
              <h1>Projects</h1>
              <button className="btn btn-solid" onClick={() => router.push('/new-project')}>+ New project</button>
            </div>

            {loading && <div className="projects-empty">Loading projects…</div>}
            {error && <div className="projects-empty">Couldn't load projects: {error}</div>}

            {!loading && !error && projects.length === 0 && (
              <div className="projects-empty">
                No projects yet — be the first to post one.
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="projects-list">
                {projects.map((p) => (
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
                    {p.tech_stack && (
                      <div className="project-tags">
                        {p.tech_stack.split(',').map((tag, i) => (
                          <span className="project-tag" key={i}>{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="project-links">
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer">GitHub →</a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer">Live demo →</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}