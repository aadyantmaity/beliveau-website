// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0rnhY3Ahy6R0wWvcaFwJFWvDoQXFSwDU",
  authDomain: "beliveaudata.firebaseapp.com",
  projectId: "beliveaudata",
  storageBucket: "beliveaudata.firebasestorage.app",
  messagingSenderId: "919600012229",
  appId: "1:919600012229:web:5b2fec9da8999a19b749ac",
  measurementId: "G-4ZNVT0LB8C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
