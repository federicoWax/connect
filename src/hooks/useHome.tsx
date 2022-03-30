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
import { User } from 'firebase/auth';

const db = getFirestore();
const queryUsers = query(collection(db, "users"), orderBy('name'));
const StartDate = moment();
StartDate.set({ hour:0, minute:0, second:0, millisecond:0});

const getColumns = (setUser: React.Dispatch<React.SetStateAction<Sale | null>>, setOpen: React.Dispatch<React.SetStateAction<boolean>>, users: UserFirestore[]) => [
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
    title: 'Concluida',
    key: 'concluded',
    render: (record: Sale) => (
      <Switch 
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
    render: (user: Sale) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setUser(user);
        }} 
      />
    )
  },
];

const getQuery = (filter: FilterSale, userFirestore: UserFirestore, user: User) => 
  userFirestore?.role === 'Vendedor' 
  ? 
    query(
      collection(db, "sales"), 
      orderBy('date'), 
      where('userId', '==', filter.userId), 
      where('concluded', '==', filter.concluded), 
      where("date", ">=", filter.startDate?.toDate()), 
      where("date", "<=", filter.endDate?.toDate())
    )
  : 
    query(
      collection(db, "sales"), 
      orderBy('date'), 
      where('concluded', '==', filter.concluded),
      where("date", ">=", filter.startDate?.toDate()), 
      where("date", "<=", filter.endDate?.toDate())
    )

const useUsers = () => {
  const { userFirestore, user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [filter, setFilter] = useState<FilterSale>({
    concluded: false,
    startDate: StartDate,
    endDate: moment(),
    userId: user?.uid
  });
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers); 
  const columns = getColumns(setSale, setOpen, users);

  const [Query, setQuery] = useState<Query<DocumentData>>(
    getQuery(filter, userFirestore as UserFirestore, user as User)
  );

  const [snapshotSale, loadingSales] = useOnSnapshot(Query); 

  useEffect(() => {
    setQuery(getQuery(filter, userFirestore as UserFirestore, user as User));
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

  return { loadingUsers, loadingSales, sales, columns, sale, open, setOpen, setSale, filter, setFilter };
}

export default useUsers;