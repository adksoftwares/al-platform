import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA6XxvFiLpLqAlU1N5YlFNaxB2mmTT3N24",
  authDomain: "al-students.firebaseapp.com",
  databaseURL: "https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "al-students",
  storageBucket: "al-students.firebasestorage.app",
  messagingSenderId: "365592581581",
  appId: "1:365592581581:web:alappwebclient"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
