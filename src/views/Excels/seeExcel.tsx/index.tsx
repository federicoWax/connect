import { message } from 'antd';
import { doc, DocumentData, DocumentReference, DocumentSnapshot, getFirestore } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FullLoader from '../../../components/FullLoader';
import useDocOnSnapshot from '../../../hooks/useDocOnSnapshot';
import { Excel, UserTag } from '../../../interfaces';
import { getDocById } from '../../../services/firebase';
import UserTags from './userTags';


const SeeExcel = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [excel, setExcel] = useState<Excel>();
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const queryExcel = useMemo<DocumentReference<DocumentData> | null>(() => {
    if(!id) return null;

    return doc(getFirestore(), "exceles", id);
  }, [id]);
  const [docSnapExcel, loadingExcel] = useDocOnSnapshot(queryExcel); 

  useEffect(() => {
    let mounted = true;

    if(loadingExcel) return;

    const init = async () => {
      try {
        const excel = {...docSnapExcel?.data(), id: docSnapExcel?.id} as Excel;

        let docPromises:  Promise<DocumentSnapshot<DocumentData>>[] = [];

        for (let i = 0; i < excel.userIds.length; i++) {
          const userId = excel.userIds[i];
          
          docPromises.push(getDocById("users", userId));
        }

        const allDocs = await Promise.all(docPromises);

        if(loading) {}

        const _userTags = allDocs.map(doc => {
          const randomColor = Math.floor(Math.random()*16777215).toString(16);
          
          return {
            ...doc.data(),
            id: doc.id,
            color: `#${randomColor}`
          } as UserTag
        });

        if(!mounted) return;

        setUserTags(_userTags);
        setExcel(excel);  
      } catch (error) {
        console.log(error);
        message.error("Error al cargar el excel!");        
      } finally {
        if(!mounted) return;

        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    }
  }, [docSnapExcel, loadingExcel]);

  if(loading) return <FullLoader />

  return (
    <div>
      <h1>Excel: {excel?.name}</h1>
      <UserTags />
    </div>
  )
}

export default SeeExcel;