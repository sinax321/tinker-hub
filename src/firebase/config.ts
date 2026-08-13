import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvrMUKZFmWLLo_BkOCj-GGXe-YjcXJVBk",
  authDomain: "tinker-hub.firebaseapp.com",
  databaseURL: "https://tinker-hub-default-rtdb.firebaseio.com",
  projectId: "tinker-hub",
  storageBucket: "tinker-hub.firebasestorage.app",
  messagingSenderId: "817993831742",
  appId: "1:817993831742:web:37127e84c0492b02c8c86f",
  measurementId: "G-TLNEB8GWHC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
