import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// Drop this into any page to require login.
// Usage inside a page component:
//   const { session, loading } = useRequireAuth();
//   if (loading) return <div className="dash-loading mono">Loading...</div>;
//   (session is guaranteed non-null past this point)
export function useRequireAuth() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        router.replace('/');
        return;
      }

      setSession(session);
      setLoading(false);
    }
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return { session, loading };
}