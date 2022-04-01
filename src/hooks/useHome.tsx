import { useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, where, onSnapshot, doc, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { FilterSale, Sale, UserFirestore } from "../interfaces";
import { del, update } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const db = getFirestore();
const StartDate = moment();
const EndDate = moment();

StartDate.set({ hour:0, minute:0, second:0, millisecond:0});
EndDate.set({ hour:24, minute:59, second:59, millisecond:59});

const getColumns = (
  setSale: React.Dispatch<React.SetStateAction<Sale | null>>, 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>, 
  users: UserFirestore[], userFirestore: UserFirestore
) => [
  {
    title: 'Vendedor',
    key: 'seller',
    render: (record: Sale) => {
      const user = users.find(user =>  user.id === record.userId);
      
      return (
        <>
          <div> { user?.name }</div>
          <div> { user?.email }</div>
        </>
      )
    }
  },
  {
    title: 'Cliente',
    key: 'client',
    dataIndex: 'client',
    render: (text: string) => text
  },
  {
    title: 'Estatus luz',
    key: 'statusLight',
    dataIndex: 'statusLight',
    render: (text: string) => text
  },
  {
    title: 'Fecha / Hora',
    key: 'date',
    render: (record: Sale) => <div>{moment(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
  },
  {
    title: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? 'Concluida' : '',
    key: 'concluded',
    render: (record: Sale) => (
      ["Administrador", "Procesos"].includes(userFirestore?.role as string) && <Switch 
        checked={record.concluded}
        onChange={async (checket) => await update("sales", record.id as string, {concluded: checket})}
      />
    )
  },
  {
    title: 'Eliminar',
    key: 'delete',
    render: (record: Sale) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {
          const deleteUser = () => del("sales", record.id as string);

          dialogDeleteDoc(deleteUser);
        }}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (sale: Sale) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setSale(sale);
        }} 
      />
    )
  },
];

const getQuery = (filter: FilterSale, userFirestore: UserFirestore) => {
  const { startDate, endDate, concluded, userId } = filter;

  let Query = query(
    collection(db, "sales"), 
    orderBy('date'), 
    where('concluded', '==', concluded),
    where("date", ">=", startDate ? startDate.toDate() : StartDate.toDate()), 
    where("date", "<=", endDate ? endDate.toDate(): EndDate.toDate())
  )
  
  if(userId) 
    Query = query(Query, where('userId', '==', userId));

  return Query;
}

const useUsers = () => {
  const { userFirestore, user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [filter, setFilter] = useState<FilterSale>({
    concluded: false,
    startDate: null,
    endDate: null,
    userId: userFirestore?.role === "Administrador" ? "" : user?.uid
  });
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name'), where("role", "==", "Vendedor")));
  const [querySales, setQuerySales] = useState<Query<DocumentData>>(getQuery(filter, userFirestore as UserFirestore));
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers); 
  const [snapshotSale, loadingSales] = useOnSnapshot(querySales); 
  const columns = getColumns(setSale, setOpen, users, userFirestore as UserFirestore);

  useEffect(() => {
    setQuerySales(getQuery(filter, userFirestore as UserFirestore));
  }, [filter, userFirestore, user]);
      
  useEffect(() => {
    let mounted = true;

    if(loadingUsers || loadingSales || !mounted) return;

    setUsers(snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);
    setSales(snapshotSale.docs.map(doc => ({...doc.data(), id: doc.id })) as Sale[]);

    return () => {
      mounted = false;
    }
  }, [snapshotSale, loadingSales, snapshotUsers, loadingUsers]);

  return { loadingUsers, loadingSales, users, sales, columns, sale, open, setOpen, setSale, filter, setFilter };
}

export default useUsers;