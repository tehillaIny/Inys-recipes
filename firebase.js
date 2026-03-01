import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOw7tmQsbEN1Oww5ffeOgqOUPN3BwG8IM",
  authDomain: "inysrecipe.firebaseapp.com",
  projectId: "inysrecipe",
  storageBucket: "inysrecipe.firebasestorage.app",
  messagingSenderId: "584173368388",
  appId: "1:584173368388:web:99484d0e11dd091f373811",
  measurementId: "G-JSZFRPG6KY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// שימוש בפונקציה שמפעילה את עצמה מיד (IIFE) - פותר את שגיאת ה-TypeScript!
const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (error) {
    return getFirestore(app);
  }
})();

export { db };