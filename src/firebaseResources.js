import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnRgfdRoC3VZtA1q8C4v-rz2Va1mAz0QQ",
  authDomain: "cs-110-project.firebaseapp.com",
  projectId: "cs-110-project",
  storageBucket: "cs-110-project.firebasestorage.app",
  messagingSenderId: "963543106242",
  appId: "1:963543106242:web:63a131720a0379f80f315b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
