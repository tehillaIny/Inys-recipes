import React, { useEffect } from 'react';
import Head from 'next/head';
import "../styles/globals.css";
import Layout from "../Layout";

function MyApp({ Component, pageProps }) {
  
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

  return (
    <Layout>
      <Head>
        <title>Iny's Recipes</title>
        <meta name="description" content="אוסף המתכונים של תהילה" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f59e0b" />
        
        {/* חיבור למניפסט שיצרנו */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;