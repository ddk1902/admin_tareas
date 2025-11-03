// firebase.example.js
// Copiá esta plantilla y renombralá como firebase.js para uso local
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "todoapp-651a5",
  storageBucket: "todoapp-651a5.appspot.com",
  messagingSenderId: "55781163126",
  appId: "1:55781163126:web:7aab129604d34275e35f57",
};

export const app = initializeApp(firebaseConfig);
