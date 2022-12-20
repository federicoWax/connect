import { RcFile } from "antd/es/upload";
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, QueryConstraint, query } from "firebase/firestore";
import { getStorage, ref, deleteObject, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

export const getCollection = (path: string, _query: QueryConstraint[]) => getDocs(query(collection(db, path), ..._query))

export const getDocById = (collection: string, id: string) => getDoc(doc(db, collection, id)); 

export const add = (collectionName: string, data: any) => addDoc(collection(db, collectionName), data);

export const update = (collection: string, id: string, data: any) => updateDoc(doc(db, collection, id), data);

export const del = (collection: string, id: string) => deleteDoc(doc(db, collection, id));

export const deleteFile = (url: string) => deleteObject(ref(storage, url));

export const getBlobByUrl = (url: string) => getBlob(ref(storage, url));

export const uploadFile = async (path: string, file: RcFile) => {
  try {
    const url = path + "/" + new Date().toString() + " - " + file.name;
    const storageRef = ref(storage, url);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.log(error);
    return "";
  }
}