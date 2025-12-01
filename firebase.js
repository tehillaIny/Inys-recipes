// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOw7tmQsbEN1Oww5ffeOgqOUPN3BwG8IM",
  authDomain: "inysrecipe.firebaseapp.com",
  projectId: "inysrecipe",
  storageBucket: "inysrecipe.firebasestorage.app",
  messagingSenderId: "584173368388",
  appId: "1:584173368388:web:99484d0e11dd091f373811",
  measurementId: "G-JSZFRPG6KY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
