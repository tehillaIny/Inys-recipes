import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { App as CapacitorApp } from '@capacitor/app'; 
import "../styles/globals.css";
import Layout from "../Layout";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // הגדרת Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const savedRoute = localStorage.getItem('lastVisitedRoute');
    const savedTime = localStorage.getItem('lastVisitedTime');

    const isLandingOnHomePage = router.asPath === '/';

    if (isLandingOnHomePage && savedRoute && savedRoute !== '/' && savedTime) {
      const timeDiff = new Date().getTime() - parseInt(savedTime, 10);
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 12) {
        router.push(savedRoute);
      } else {
        localStorage.removeItem('lastVisitedRoute');
        localStorage.removeItem('lastVisitedTime');
      }
    }

    const handleRouteChange = (url) => {
      localStorage.setItem('lastVisitedRoute', url);
      localStorage.setItem('lastVisitedTime', new Date().getTime().toString());
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.isReady, router.asPath]);

  useEffect(() => {
    const handleBackButton = async () => {
      await CapacitorApp.addListener('backButton', () => {
        const event = new CustomEvent('hardwareBackButton', { cancelable: true });
        window.dispatchEvent(event);
        
        if (event.defaultPrevented) {
          return; 
        }
        if (router.pathname === '/' || router.pathname === '/AllRecipes' || router.pathname === '/Categories' || router.pathname === '/Events' || router.pathname === '/Conversions') {
          CapacitorApp.exitApp();
        } else {
          router.back();
        }
      });
    };

    handleBackButton();

    return () => {
      CapacitorApp.removeAllListeners('backButton');
    };
  }, [router]);

  return (
    <Layout>
      <Head>
        <title>Iny's Recipes</title>
        <meta name="description" content="אוסף המתכונים של תהילה" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f59e0b" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;