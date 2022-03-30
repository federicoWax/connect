import { useEffect, useState } from 'react'
import { DocumentData, Query, QuerySnapshot } from 'firebase/firestore';
import { onSnapshot } from "firebase/firestore";

const useOnSnapshot = (query: Query<DocumentData>): [QuerySnapshot<DocumentData>, boolean]  => {
  const [loading, setLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<QuerySnapshot<DocumentData>>();

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
  }, [query]);

  return [snapshot as QuerySnapshot<DocumentData>, loading];
}

export default useOnSnapshot;