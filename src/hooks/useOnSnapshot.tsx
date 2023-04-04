import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { DocumentData, Query, QuerySnapshot } from 'firebase/firestore';
import { onSnapshot } from "firebase/firestore";

const useOnSnapshot = (query: Query<DocumentData> | null, loadingOnChangeQuery?: boolean): [QuerySnapshot<DocumentData> | undefined, boolean, Dispatch<SetStateAction<boolean>>]  => {
  const [loading, setLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<QuerySnapshot<DocumentData>>();

  useEffect(() => {
    let mounted = true;

    if(!query) return;

    if(loadingOnChangeQuery) {
      setLoading(true);
    }

    const uns = onSnapshot(query, (_snapshot) => {
      if (!mounted) return;

      setSnapshot(_snapshot);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => {
      mounted = false;
      uns();
    }
  }, [query, loadingOnChangeQuery]);

  return [snapshot, loading, setLoading];
}

export default useOnSnapshot;