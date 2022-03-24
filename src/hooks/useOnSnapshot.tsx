import { DocumentData, Query, QuerySnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { onSnapshot, getFirestore } from "firebase/firestore";

const db = getFirestore();

const useOnSnapshot = (query: Query<unknown>): [QuerySnapshot<DocumentData>, boolean]  => {
  const [loading, setLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<QuerySnapshot<unknown>>();

  useEffect(() => {
    let mounted = true;

    const uns = onSnapshot(query, (_snapshot) => {
      if (!mounted) return;

      setSnapshot(_snapshot);
      setLoading(false);
    });

    return () => {
      mounted = false;
      uns();
    }
  }, []);

  return [snapshot as QuerySnapshot<DocumentData>, loading];
}

export default useOnSnapshot;