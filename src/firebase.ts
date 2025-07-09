import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAnalytics } from 'firebase/analytics'; // Only use in browser

const firebaseConfig = {
  apiKey: "AIzaSyBBMYQOrZffI5LZEGE_bx1p6pFdeM8Ez0c",
  authDomain: "admitcoach.firebaseapp.com",
  projectId: "admitcoach",
  storageBucket: "admitcoach.firebasestorage.app",
  messagingSenderId: "790508699860",
  appId: "1:790508699860:web:23d25affbdebb4e01a3b41",
  measurementId: "G-6MC56VQN67",
};

// Initialize Firebase only once (for Next.js hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics should only be initialized in the browser
// let analytics;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

export { app };
