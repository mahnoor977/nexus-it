import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#17140F" />
        <meta name="description" content="A verified space for IT builders to showcase projects, find collaborators, and get real feedback." />
      </Head>
      <div className={transitioning ? 'page-transitioning' : ''}>
        <Component {...pageProps} />
      </div>
    </>
  );
}