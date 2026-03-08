import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { App as CapacitorApp } from '@capacitor/app'; 
import "../styles/globals.css";
import Layout from "../Layout";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
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
    const handleBackButton = async () => {
      await CapacitorApp.addListener('backButton', () => {
        if (router.pathname === '/' || router.pathname === '/AllRecipes') {
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