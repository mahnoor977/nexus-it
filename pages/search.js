import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';

export default function Search() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [query, setQuery] = useState('');
  const [projectResults, setProjectResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setNickname(session.user.user_metadata?.nickname || session.user.email);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProjectResults([]);
      setPeopleResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%,tech_stack.ilike.%${trimmed}%`)
        .limit(10);

      const { data: people } = await supabase
        .from('profiles')
        .select('*')
        .or(`nickname.ilike.%${trimmed}%,bio.ilike.%${trimmed}%,skills.ilike.%${trimmed}%`)
        .limit(10);

      setProjectResults(projects || []);
      setPeopleResults(people || []);
      setSearching(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <Head>
        <title>Search — NEXUS-IT</title>
      </Head>
      <div className="app-shell">
        <Sidebar nickname={nickname} />
        <div className="app-main">
          <div className="search-page-content page-shell wide">
            <h1 style={{ marginBottom: '20px' }}>Search</h1>

            <div className="search-input-wrap">
              <i className="ti ti-search"></i>
              <input
                type="text"
                placeholder="Search projects, tech stacks, or people..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {searching && <div className="projects-empty">Searching…</div>}

            {!searching && query.trim() && peopleResults.length === 0 && projectResults.length === 0 && (
              <div className="projects-empty">No results for "{query}"</div>
            )}

            {peopleResults.length > 0 && (
              <>
                <div className="search-section-label">People</div>
                {peopleResults.map((p) => (
                  <div
                    className="search-person-row"
                    key={p.id}
                    onClick={() => router.push(`/user/${p.id}`)}
                  >
                    <Avatar url={p.avatar_url} nickname={p.nickname} size={36} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{p.nickname}</div>
                      {p.bio && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{p.bio}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {projectResults.length > 0 && (
              <>
                <div className="search-section-label">Projects</div>
                <div className="projects-list">
                  {projectResults.map((p) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}