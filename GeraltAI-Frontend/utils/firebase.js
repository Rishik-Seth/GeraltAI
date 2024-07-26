// Import the functions you need from the SDKs you need
import { initializeApp, } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqIcsIkvhvSQNwhCV9SQf35e8kQHdyiRc",
  authDomain: "attendance-1a264.firebaseapp.com",
  databaseURL: "https://attendance-1a264-default-rtdb.firebaseio.com",
  projectId: "attendance-1a264",
  storageBucket: "attendance-1a264.appspot.com",
  messagingSenderId: "281819876319",
  appId: "1:281819876319:web:8de5b12f0e5169b1e9126a",
  measurementId: "G-V7LZ62694B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);