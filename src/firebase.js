import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

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
  try {
    const q = query(transaccionesRef, orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    // Si hay docs sin creadoEn, también los traemos
    const conTimestamp = snapshot.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
    const allSnapshot = await getDocs(transaccionesRef);
    const todos = allSnapshot.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
    const idsConTimestamp = new Set(conTimestamp.map(t => t.firebaseId));
    const sinTimestamp = todos.filter(t => !idsConTimestamp.has(t.firebaseId));
    return [...conTimestamp, ...sinTimestamp];
  } catch {
    const snapshot = await getDocs(transaccionesRef);
    return snapshot.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
  }
}

export async function addTransaccion(transaccion) {
  const docRef = await addDoc(transaccionesRef, { ...transaccion, creadoEn: serverTimestamp() });
  return { ...transaccion, firebaseId: docRef.id };
}

export async function updateTransaccion(firebaseId, data) {
  await updateDoc(doc(db, 'transacciones', firebaseId), data);
}

export async function deleteTransaccion(firebaseId) {
  await deleteDoc(doc(db, 'transacciones', firebaseId));
}
