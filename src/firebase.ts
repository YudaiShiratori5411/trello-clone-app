import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebaseの設定情報（FirebaseコンソールからWebアプリの設定情報をコピー）
const firebaseConfig = {
  apiKey: "AIzaSyDWsU-bBhm4pXFdAGc5w1Z7dH3PaLkP13c",
  authDomain: "trello-clone-app-5799f.firebaseapp.com",
  projectId: "trello-clone-app-5799f",
  storageBucket: "trello-clone-app-5799f.firebasestorage.app",
  messagingSenderId: "394881956203",
  appId: "1:394881956203:web:de12bbb777f590ba5cf42e",
  measurementId: "G-KYKXMNBH26"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };