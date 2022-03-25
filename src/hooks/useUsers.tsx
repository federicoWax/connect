import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { UserFirestore } from "../interfaces";
import { post } from '../services/http';
import { dialogDeleteDoc } from '../utils';

const db = getFirestore();

const getColumns = (setUser: React.Dispatch<React.SetStateAction<UserFirestore | null>>, setOpen: React.Dispatch<React.SetStateAction<boolean>> ) => [
  {
    title: 'Nombre',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Correo',
    dataIndex: 'email',
    key: 'email',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Rol',
    dataIndex: 'role',
    key: 'role',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Teléfono',
    dataIndex: 'phone',
    key: 'phone',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Equipo',
    dataIndex: 'team',
    key: 'team',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Ciudad',
    dataIndex: 'city',
    key: 'city',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Eliminar',
    key: 'delete',
    render: (text: string, record: UserFirestore) => (
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
    render: (text: string, user: UserFirestore) => (
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
  const [user, setUser] = useState<UserFirestore | null>(null);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [snapshot, loading] = useOnSnapshot(query(collection(db, "users"), orderBy('name')));
  const columns = getColumns(setUser, setOpen);

  useEffect(() => {
    let mounted = true;

    if(loading || !mounted) return;

    setUsers(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);

    return () => {
      mounted = false;
    }
  }, [snapshot, loading]);

  return { loading, users, columns, open, user, setOpen, setUser };
}

export default useUsers;