import { collection, DocumentData, getFirestore, orderBy, query, Query, where } from "firebase/firestore";
import moment from "moment";
import { useEffect, useState } from "react";
import { Assistence, FilterAssists, Sale, UserFirestore } from "../interfaces";
import useOnSnapshot from "./useOnSnapshot";

const db = getFirestore();
const StartDate = moment().set({ hour:0, minute:0, second:0});
const EndDate = moment().set({ hour:23, minute:59, second:59});

const getQueryAssists = (filter: FilterAssists) => {
  const { startDate, endDate } = filter;

  const Query = query(
    collection(db, "assists"), 
    where("date", ">=", startDate ? startDate.toDate() : StartDate.toDate()),
    where("date", "<=", endDate ? endDate.toDate() : EndDate.toDate())
  );
  
  return Query;
}

const useAssists = () => {
  const [filter, setFilter] = useState<FilterAssists>({
    startDate: null,
    endDate: null
  });
  const [queryAssists, setQueryAssists] = useState<Query<DocumentData>>(getQueryAssists(filter));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [snapshotAssists, loadingAssists] = useOnSnapshot(queryAssists);
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers);
  const [assists, setAssists] = useState<Assistence[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if(!loadingAssists && !loadingUsers) {
      const users = snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore [];

      setAssists(
        snapshotAssists.docs.map(doc => {
          const user = users.find(u => u.id === doc.data().userId);

          return ({...doc.data(), ...user, id: doc.id})
        }) as Assistence []
      );
    }
  }, [loadingAssists, loadingUsers, snapshotAssists, snapshotUsers]);

  useEffect(() => {
    setQueryAssists(getQueryAssists(filter));
  }, [filter]);

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (record: Assistence) => {
        return (
          <>
            <div> Nombre:  { record?.name }</div>
            <div> Correo: { record?.email }</div>    
            <div> Equipo: { record?.team || "" }</div>        
          </>
        )
      }
    },
    {
      title: 'Fecha',
      key: 'date',
      render: (record: Sale) => <div>{moment(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Tipo de registro',
      key: 'typeRegister',
      dataIndex: 'typeRegister',
      render: (text: string) => text
    }
  ];

  return { loadingAssists, assists, columns, search, setSearch, filter, setFilter }
}

export default useAssists;