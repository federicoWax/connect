import { useEffect, useState } from 'react'
import { DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { onSnapshot } from "firebase/firestore";

const useDocOnSnapshot = (query: DocumentReference<DocumentData>  | null): [DocumentSnapshot<DocumentData> | undefined, boolean] => {
  const [loading, setLoading] = useState<boolean>(true);
  const [docSnapshot, setDocSnapshot] = useState<DocumentSnapshot<DocumentData>>();

  useEffect(() => {
    let mounted = true;

    if(!query) return;

    const uns = onSnapshot(query, (_snapshot) => {
      if (!mounted) return;

      setDocSnapshot(_snapshot);
      setLoading(false);
    });

    return () => {
      mounted = false;
      uns();
    }
  }, [query]);

  return [docSnapshot, loading];
}

export default useDocOnSnapshot;