import { useEffect, useState } from 'react';
import { DocumentData, getDocs, Query, QuerySnapshot } from 'firebase/firestore';

const useCollection = (query: Query<DocumentData>): [QuerySnapshot<DocumentData>, boolean] => {
  const [loading, setLoading] = useState<boolean>(true);
  const [snapshot, setSnapshot] = useState<QuerySnapshot<DocumentData>>();

  useEffect(() => {
    let mounted = true;

    const getCol = async () => {
      if (!mounted) return;

      const _snapshot = await getDocs(query);
      setSnapshot(_snapshot);
      setLoading(false);
    };

    getCol();

    return () => {
      mounted = false;
    };
  }, [query]);

  return [snapshot as QuerySnapshot<DocumentData>, loading];
};

export default useCollection;