import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyD3tDWmGkWMjY-BXLVnYvugt2YgW_Mlo28",
  authDomain: "firstapp-ec5f5.firebaseapp.com",
  projectId: "firstapp-ec5f5",
  storageBucket: "firstapp-ec5f5.firebasestorage.app",
  messagingSenderId: "131854464799",
  appId: "1:131854464799:web:3671611d9c3dcaaa3a222a",
  measurementId: "G-P2M31QH3EY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)


export { db, auth};