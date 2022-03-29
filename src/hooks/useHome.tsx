import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Sale, UserFirestore } from "../interfaces";
import { post } from '../services/http';
import { dialogDeleteDoc } from '../utils';

const db = getFirestore();

const getColumns = (setUser: React.Dispatch<React.SetStateAction<Sale | null>>, setOpen: React.Dispatch<React.SetStateAction<boolean>> ) => [
  {
    title: 'Eliminar',
    key: 'delete',
    render: (text: string, record: Sale) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {
          const deleteUser = post('users/del', {id: record.id}) as Promise<void>;

          dialogDeleteDoc(deleteUser);
        }}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (text: string, user: Sale) => (
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

const useUsers = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [snapshotSales, loadingSales] = useOnSnapshot(query(collection(db, "sales"), orderBy('date')));
  const [snapshotUsers, loadingUsers] = useOnSnapshot(query(collection(db, "users"), orderBy('name')));
  const columns = getColumns(setSale, setOpen);

  useEffect(() => {
    let mounted = true;

    if(loadingSales || loadingUsers || !mounted) return;

    setSales(snapshotSales.docs.map(doc => ({...doc.data(), id: doc.id})) as Sale[]);
    setUsers(snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);

    return () => {
      mounted = false;
    }
  }, [snapshotSales, snapshotUsers, loadingSales, loadingUsers]);

  return { loadingUsers, loadingSales, sales, users, columns, open, sale, setOpen, setSale };
}

export default useUsers;