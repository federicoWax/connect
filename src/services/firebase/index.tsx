import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, query, QueryConstraint, DocumentData, Query } from "firebase/firestore";

const db = getFirestore();

export const getDocById = (collection: string, id: string) => getDoc(doc(db, collection, id)); 

export const add = (collectionName: string, data: any) => addDoc(collection(db, collectionName), data);

export const update = (collection: string, id: string, data: any) => updateDoc(doc(db, collection, id), data);

export const del = (collection: string, id: string) => deleteDoc(doc(db, collection, id));