import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

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
        setNickname(session.user.user_metadata?.nickname || 'Builder');
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
        <title>Search · NEXUS-IT</title>
      </Head>

      <Sidebar nickname={nickname} />

      <div className="app-main">
        <div style={{ padding: '36px 48px', maxWidth: '800px' }}>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '36px', color: '#1A1A1A', marginBottom: '24px' }}>
            Search
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            border: '1px solid #E5E0D8',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '36px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <i className="ti ti-search" style={{ color: '#C5A059', fontSize: '18px' }}></i>
            <input
              type="text"
              placeholder="Search projects, tech stacks, or people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'transparent', color: '#1A1A1A' }}
            />
          </div>

          {searching && <div style={{ color: '#6B6558' }}>Searching…</div>}

          {!searching && query.trim() && peopleResults.length === 0 && projectResults.length === 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: '14px',
              padding: '40px',
              textAlign: 'center',
              color: '#6B6558'
            }}>
              No results for “{query}”
            </div>
          )}

          {peopleResults.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B6558', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                People
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {peopleResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/user/${p.id}`)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E0D8',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#C5A059',
                      color: '#1A1A1A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {(p.nickname || 'B').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1A1A1A' }}>{p.nickname}</div>
                      {p.bio && <div style={{ fontSize: '13px', color: '#6B6558' }}>{p.bio.slice(0, 80)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectResults.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B6558', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Projects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/project/${p.id}`)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E0D8',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '6px' }}>{p.title}</div>
                    <div style={{ fontSize: '14px', color: '#6B6558' }}>
                      {p.description?.slice(0, 120)}{p.description?.length > 120 ? '…' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}