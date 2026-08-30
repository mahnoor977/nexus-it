import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — NEXUS-IT</title>
      </Head>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 5vw', color: 'var(--text)' }}>
        <Link href="/" style={{ color: 'var(--tea)', fontSize: '13px' }}>&larr; Back to home</Link>
        <h1 style={{ marginTop: '20px', marginBottom: '20px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.7 }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Using NEXUS-IT</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          NEXUS-IT is a free platform for IT builders to showcase projects, collaborate, and get feedback. By
          creating an account, you agree to use it respectfully and in good faith.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Community standards</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          Be respectful and constructive in feedback. Give credit for others' work. Don't harass, spam, or share
          content that isn't yours to share. Violations may result in content removal or account suspension.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Your content</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          You own what you post. By posting, you allow it to be shown publicly on the platform to other members
          and visitors, as intended by the feature you used to post it.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Reporting and moderation</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          You can report content or block users who violate these terms. We review reports and may remove content
          or restrict accounts that don't follow these standards.
        </p>

        <h2 style={{ fontSize: '18px', margin: '30px 0 10px' }}>Changes</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          These terms may be updated as the platform grows. Continued use after changes means you accept the
          updated terms.
        </p>
      </div>
    </>
  );
}