import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  // Apply the saved theme on every page load (the toggle lives in the
  // app sidebar, but the landing page needs the theme too)
  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }, []);

  // Password-recovery links can land on any page; always route them to
  // the reset screen once the client consumes the one-time session
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') router.push('/reset-password');
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleStart = () => setTransitioning(true);
    const handleComplete = () => setTransitioning(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#17140F" />
      </Head>
        <div className={transitioning ? 'page-transitioning' : ''}>
        <Component {...pageProps} />
      </div>
    </>
  );
}