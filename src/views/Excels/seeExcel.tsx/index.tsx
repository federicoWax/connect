import { Divider, message } from 'antd';
import { doc, DocumentData, DocumentReference, DocumentSnapshot, getFirestore } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FullLoader from '../../../components/FullLoader';
import useDocOnSnapshot from '../../../hooks/useDocOnSnapshot';
import { Excel, UserFirestore, UserTag } from '../../../interfaces';
import { getDocById } from '../../../services/firebase';
import UserTags from './userTags';

const SeeExcel = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [excel, setExcel] = useState<Excel>();
  const [userIds, setUserIds] = useState<string[]>([]);
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
        const _userIds = excel.userIds;
        const userColors = excel.userColors;

        if(JSON.stringify(excel.userIds) !== JSON.stringify(userIds)) {
          setUserIds(_userIds);

          for (let i = 0; i < excel.userIds.length; i++) {
            const userId = excel.userIds[i];
            
            docPromises.push(getDocById("users", userId));
          }
  
          const allDocs = await Promise.all(docPromises);
          const _userTags = allDocs.map((doc) => ({...doc.data(), id: doc.id, color: userColors.find(u => u.userId === doc.id)?.color })) as UserTag[];

          if(!mounted) return;
          setUserTags(_userTags);
        }

        if(!mounted) return;
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
  }, [docSnapExcel, loadingExcel, loading]);

  if(loading) return <FullLoader />

  return (
    <div>
      <h1>Excel: {excel?.name}</h1>
      <UserTags userTags={userTags}/>
      <Divider />
    </div>
  )
}

export default SeeExcel;