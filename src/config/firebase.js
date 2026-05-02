// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXPf52D_jO60-K5I9yI8JvPxDMnY0eg9c",
  authDomain: "hard-day-challenge.firebaseapp.com",
  databaseURL: "https://hard-day-challenge-default-rtdb.firebaseio.com",
  projectId: "hard-day-challenge",
  storageBucket: "hard-day-challenge.firebasestorage.app",
  messagingSenderId: "889893558776",
  appId: "1:889893558776:web:6681d50686e0bd2884de0d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
