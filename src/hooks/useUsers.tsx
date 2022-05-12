import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Team, UserFirestore } from "../interfaces";
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
          const deleteUser = () => post('users/del', {id: record.id});

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
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [queryTeams] = useState<Query<DocumentData>>(query(collection(db, "teams"), orderBy('name')));
  const [snapshot, loading] = useOnSnapshot(queryUsers);
  const [snapshotTeams, loadingTeams] = useOnSnapshot(queryTeams);
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserFirestore | null>(null);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const columns = getColumns(setUser, setOpen);

  useEffect(() => {
    let mounted = true;

    if(loading || loadingTeams || !mounted) return;

    setUsers(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);
    setTeams(snapshotTeams.docs.map(doc => ({...doc.data(), id: doc.id})) as Team[]);

    return () => {
      mounted = false;
    }
  }, [snapshot, snapshotTeams, loading, loadingTeams]);

  return { loading, users, columns, open, user, setOpen, setUser, loadingTeams, teams };
}

export default useUsers;