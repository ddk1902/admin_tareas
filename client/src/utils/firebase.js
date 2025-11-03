import { initializeApp } from "firebase/app";
<<<<<<< HEAD
import { getStorage } from "firebase/storage"
=======
import { getStorage } from "firebase/storage";
>>>>>>> 70d585e (Build exitoso local, listo para deploy en Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "todoapp-651a5.firebaseapp.com",
  projectId: "todoapp-651a5",
  storageBucket: "todoapp-651a5.appspot.com",
  messagingSenderId: "55781163126",
  appId: "1:55781163126:web:7aab129604d34275e35f57",
};

export const app = initializeApp(firebaseConfig);
<<<<<<< HEAD
export const storage = getStorage(app);
=======
export const storage = getStorage(app);
>>>>>>> 70d585e (Build exitoso local, listo para deploy en Vercel)
