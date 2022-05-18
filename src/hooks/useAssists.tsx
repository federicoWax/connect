import { collection, DocumentData, getFirestore, orderBy, query, Query, where } from "firebase/firestore";
import moment from "moment";
import { useEffect, useState } from "react";
import { Assistence, Sale, UserFirestore } from "../interfaces";
import useOnSnapshot from "./useOnSnapshot";

const db = getFirestore();
const initDate = moment().set({ hour:0, minute:0, second:0, millisecond:0});

const useAssists = () => {
  const [queryAssists, setQueryAssists] = useState<Query<DocumentData>>(query(collection(db, "assists"),  where("date", "==", initDate.toDate())));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [snapshotAssists, loadingAssists] = useOnSnapshot(queryAssists);
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers);
  const [assists, setAssists] = useState<Assistence[]>([]);
  const [search, setSearch] = useState<string>("");
  const [date, setDate] = useState<moment.Moment | null>(moment());

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
  ];

  const onChangeDate = (_date: moment.Moment | null) => {
    if(_date) {
      const d = moment(_date).set({ hour:0, minute:0, second:0, millisecond:0});
      console.log(d.toDate())
      setQueryAssists(query(collection(db, "assists"),  where("date", "==", d.toDate())))
    }

    setDate(_date);
  }

  console.log(initDate.toDate());


  return { loadingAssists, assists, columns, search, setSearch, date, onChangeDate }
}

export default useAssists;