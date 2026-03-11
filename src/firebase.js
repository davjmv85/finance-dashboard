import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALIIwddimQnA_Q_9Br4VswkeTWf-uOZVk",
  authDomain: "finance-dashboard-c5744.firebaseapp.com",
  projectId: "finance-dashboard-c5744",
  storageBucket: "finance-dashboard-c5744.firebasestorage.app",
  messagingSenderId: "339090544648",
  appId: "1:339090544648:web:3cae83198edf04f13819bd",
  measurementId: "G-96PBD3Z1Q6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const transaccionesRef = collection(db, 'transacciones');

export async function getTransacciones() {
  const snapshot = await getDocs(transaccionesRef);
  return snapshot.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
}

export async function addTransaccion(transaccion) {
  const docRef = await addDoc(transaccionesRef, transaccion);
  return { ...transaccion, firebaseId: docRef.id };
}

export async function updateTransaccion(firebaseId, data) {
  await updateDoc(doc(db, 'transacciones', firebaseId), data);
}

export async function deleteTransaccion(firebaseId) {
  await deleteDoc(doc(db, 'transacciones', firebaseId));
}
