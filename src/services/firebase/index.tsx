import { doc, getDoc, deleteDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export const getDocById = (collection: string, id: string) => getDoc(doc(db, collection, id)); 

export const delDoc = (collection: string, id: string) => deleteDoc(doc(db, collection, id));
