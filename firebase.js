// firebase.js
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

// 1. מאתחל את האפליקציה רק אם היא עדיין לא קיימת
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db;

// 2. מנסה לאתחל את מסד הנתונים עם מצב אופליין
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (error) {
  // אם זה נכשל (בגלל שזה כבר רץ ב-Hot Reload), הוא פשוט ימשוך את המצב הקיים
  db = getFirestore(app);
}

export { db };