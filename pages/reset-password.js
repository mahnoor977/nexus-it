import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    // The recovery link carries a one-time session in the URL; the client
    // consumes it shortly after load. Listen for it and also poll once.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) setHasSession(true);
    });

    const timeout = setTimeout(() => {
      if (mounted) setChecking(false);
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPass.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.replace('/projects'), 1600);
  }

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    border: '1px solid var(--line)',
    borderRadius: '10px',
    fontSize: '15px',
    background: 'var(--black)',
    color: 'var(--text)',
    outline: 'none',
  };

  return (
    <>
      <Head>
        <title>Reset password · NEXUS-IT</title>
      </Head>
      <div
        className="force-light"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'var(--black)',
        }}
      >
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '38px 34px',
          width: '100%',
          maxWidth: '440px',
        }}>
          {checking ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', margin: '20px 0' }}>
              Verifying your reset link…
            </p>
          ) : done ? (
            <div style={{ textAlign: 'center' }}>
              <div className="verify-icon" style={{ margin: '0 auto 18px', background: 'var(--tea)', color: 'var(--black)' }}>
                <i className="ti ti-check"></i>
              </div>
              <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '24px', color: 'var(--text)', marginBottom: '8px' }}>
                Password updated
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '14.5px' }}>
                Taking you to the app…
              </p>
            </div>
          ) : !hasSession ? (
            <div style={{ textAlign: 'center' }}>
              <div className="verify-icon" style={{ margin: '0 auto 18px' }}>
                <i className="ti ti-link-off"></i>
              </div>
              <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '24px', color: 'var(--text)', marginBottom: '8px' }}>
                This link is invalid or expired
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '22px' }}>
                Reset links only work once and expire quickly. Request a new one from the login screen.
              </p>
              <button className="btn btn-solid" onClick={() => router.replace('/')}>
                Back to home
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: '25px', color: 'var(--text)', marginBottom: '6px' }}>
                Choose a new password
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                Your email is verified. Set a new password for your account.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    New password
                  </label>
                  <div className="pass-wrap">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="At least 8 characters"
                      style={inputStyle}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="pass-eye"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      <i className={`ti ${showNew ? 'ti-eye-off' : 'ti-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', color: 'var(--muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Confirm new password
                  </label>
                  <div className="pass-wrap">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Re-enter password"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      className="pass-eye"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {error && (
                  <p style={{ color: '#e35d5d', fontSize: '13.5px', marginBottom: '14px' }}>{error}</p>
                )}

                <button
                  type="submit"
                  className="btn btn-solid"
                  disabled={saving}
                  style={{ width: '100%', padding: '13px' }}
                >
                  {saving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
