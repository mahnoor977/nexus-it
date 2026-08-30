import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — NEXUS-IT</title>
      </Head>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 5vw', color: 'var(--text)' }}>
        <Link href="/" style={{ color: 'var(--tea)', fontSize: '13px' }}>&larr; Back to home</Link>
        <h1 style={{ marginTop: '20px', marginBottom: '20px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.7 }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>What we collect</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          When you sign up, we collect your email address, the nickname and password you choose, and any profile
          information you add yourself (bio, skills, profile photo). When you use the platform, we store the
          projects, posts, comments, and messages you create.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>How we use it</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          Your information is used to run your account, display your public profile and projects to other members,
          and enable features like messaging, following, and search. We do not sell your data to third parties.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Where it's stored</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          Your data is stored with Supabase, our database and authentication provider. Uploaded photos and media
          are stored using Supabase Storage.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Your choices</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          You can edit or delete your projects, posts, and comments at any time. You can block other users to stop
          them from messaging you. If you'd like your account and data deleted entirely, contact us using the
          details below.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Contact</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          Questions about this policy? Reach out to the team behind NEXUS-IT directly through the platform.
        </p>
      </div>
    </>
  );
}