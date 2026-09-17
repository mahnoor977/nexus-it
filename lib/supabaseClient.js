import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// UI-only local mode: when env vars are missing, export a mock client so
// every page renders (fake session, empty data) instead of crashing.
// Logout/login state persists in localStorage so the full auth flow is
// testable: logout shows the landing page, any credentials log back in.
function createMockClient() {
  const isBrowser = typeof window !== 'undefined';
  const SIGNED_OUT_KEY = 'nexus-mock-signed-out';
  const NICKNAME_KEY = 'nexus-mock-nickname';

  const isSignedOut = () => isBrowser && localStorage.getItem(SIGNED_OUT_KEY) === '1';
  const setSignedOut = (v) => {
    if (!isBrowser) return;
    if (v) localStorage.setItem(SIGNED_OUT_KEY, '1');
    else localStorage.removeItem(SIGNED_OUT_KEY);
  };

  const fakeSession = () => ({
    user: {
      id: 'local-dev-user',
      email: 'dev@local',
      user_metadata: {
        nickname: (isBrowser && localStorage.getItem(NICKNAME_KEY)) || 'LocalDev',
      },
    },
  });

  function queryBuilder() {
    const builder = {
      _single: false,
      select() { return this; },
      insert() { return this; },
      update() { return this; },
      delete() { return this; },
      eq() { return this; },
      or() { return this; },
      in() { return this; },
      order() { return this; },
      limit() { return this; },
      single() { this._single = true; return this; },
      then(resolve) {
        resolve(this._single ? { data: null, error: null } : { data: [], error: null });
      },
    };
    return builder;
  }

  return {
    auth: {
      getSession: async () => ({
        data: { session: isSignedOut() ? null : fakeSession() },
        error: null,
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => { setSignedOut(true); return { error: null }; },
      signUp: async ({ options } = {}) => {
        if (isBrowser && options?.data?.nickname) {
          localStorage.setItem(NICKNAME_KEY, options.data.nickname);
        }
        return { data: { user: fakeSession().user }, error: null };
      },
      signInWithPassword: async () => {
        setSignedOut(false);
        return { data: { session: fakeSession(), user: fakeSession().user }, error: null };
      },
      signInWithOAuth: async () => ({ error: { message: 'Local UI mode: OAuth needs a real backend.' } }),
      verifyOtp: async () => {
        setSignedOut(false);
        return { data: { session: fakeSession(), user: fakeSession().user }, error: null };
      },
      resend: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: fakeSession().user }, error: null }),
    },
    from: () => queryBuilder(),
    storage: {
      from: () => ({
        upload: async () => ({ error: { message: 'Local UI mode: no database connected.' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Running in local UI mode with a mock client.');
}
