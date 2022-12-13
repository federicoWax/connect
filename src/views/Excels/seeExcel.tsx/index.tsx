import { collection, doc, DocumentData, DocumentReference, getFirestore, Query } from 'firebase/firestore';
import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FullLoader from '../../../components/FullLoader';
import useDocOnSnapshot from '../../../hooks/useDocOnSnapshot';
import useOnSnapshot from '../../../hooks/useOnSnapshot';
import { Excel } from '../../../interfaces';

const SeeExcel = () => {
  const { id } = useParams();

  const queryExcel = useMemo<DocumentReference<DocumentData> | null>(() => {
    if(!id) return null;

    return doc(getFirestore(), "exceles", id);
  }, [id]);
  const [docSnapExcel, loadingExcel] = useDocOnSnapshot(queryExcel); 

  const excel = useMemo<Excel | null>(() => {
    if(loadingExcel) return null;

    return {...docSnapExcel?.data(), id: docSnapExcel?.id} as Excel
  }, [docSnapExcel, loadingExcel])

  if(loadingExcel) return <FullLoader />

  return (
    <div>
      <h1>Excel: {excel?.name}</h1>
    </div>
  )
}

export default SeeExcel;