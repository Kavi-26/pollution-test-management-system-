// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// TODO: Replace with your project's config keys
const firebaseConfig = {
  apiKey: "AIzaSyARzJFCDVeAiMCfryUmrR5RU_v-Avbc4RQ",
  authDomain: "anbu-emission.firebaseapp.com",
  projectId: "anbu-emission",
  storageBucket: "anbu-emission.firebasestorage.app",
  messagingSenderId: "167438627392",
  appId: "1:167438627392:web:1d1702f4dc0c71d227e5a5",
  measurementId: "G-T5HWPPQDJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
