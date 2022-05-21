import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";
import { Team } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';

const db = getFirestore();

const getColumns = (
  setTeam: React.Dispatch<React.SetStateAction<Team | null>>, 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>, 
  setOpenPermissions: React.Dispatch<React.SetStateAction<boolean>>
) => [
  {
    title: 'Equipo',
    key: 'name',
    dataIndex: 'name',
    render: (text: string) => text
  },
  
  {
    title: 'Eliminar',
    key: 'delete',
    render: (record: Team) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {
          const deleteUser = () => del("teams", record.id as string);

          dialogDeleteDoc(deleteUser);
        }}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (team: Team) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setTeam(team);
        }} 
      />
    )
  },
  {
    title: 'Permisos',
    key: 'permissions',
    render: (team: Team) => (
      <Button 
        shape="circle" 
        icon={<UnorderedListOutlined />}
        onClick={() => {
          setOpenPermissions(true);
          setTeam(team);
        }} 
      />
    )
  },
];

const useTeams = () => {
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [openPermissions, setOpenPermissions] = useState<boolean>(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [queryTeams] = useState<Query<DocumentData>>(query(collection(db, "teams"), orderBy("name")));
  const [snapshotTeams, loadingTeams] = useOnSnapshot(queryTeams); 
  const columns = getColumns(setTeam, setOpen, setOpenPermissions);

  useEffect(() => {
    let mounted = true;

    if( loadingTeams || !mounted) return;

    setTeams(snapshotTeams.docs.map(doc => ({...doc.data(), id: doc.id })) as Team[]);

    return () => {
      mounted = false;
    }
  }, [snapshotTeams, loadingTeams]);

  return { loadingTeams, teams, columns, team, open, setOpen, setTeam, search, setSearch, openPermissions, setOpenPermissions };
}

export default useTeams;