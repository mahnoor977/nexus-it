import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  return (
    <>
      <Head>
        <title>Projects — NEXUS-IT</title>
      </Head>
      <div className="projects-page">
        <nav>
          <div className="logo">
            <button className="hamburger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
            <span>NEXUS-IT</span>
          </div>
          <div className="nav-links">
            <button className="btn" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="btn btn-solid" onClick={() => router.push('/new-project')}>+ New project</button>
          </div>
        </nav>

        <div className="projects-header">
          <h1>Projects</h1>
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
              <div className="project-card" key={p.id}>
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
    </>
  );
}