import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";
import { Branch } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';

const db = getFirestore();

const getColumns = (
  setBranch: React.Dispatch<React.SetStateAction<Branch | null>>, 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>, 
) => [
  {
    title: 'Sucursal',
    key: 'name',
    dataIndex: 'name',
    render: (text: string) => text
  },
  
  {
    title: 'Eliminar',
    key: 'delete',
    render: (record: Branch) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {
          const deleteBranch = () => del("branchs", record.id as string);

          dialogDeleteDoc(deleteBranch);
        }}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (record: Branch) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setBranch(record);
        }} 
      />
    )
  },
];

const useBranchs = () => {
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchs, setBranchs] = useState<Branch[]>([]);
  const [queryTeams] = useState<Query<DocumentData>>(query(collection(db, "branchs"), orderBy("name")));
  const [snapshotBranchs, loadingBranchs] = useOnSnapshot(queryTeams); 
  const columns = getColumns(setBranch, setOpen);

  useEffect(() => {
    let mounted = true;

    if(loadingBranchs || !mounted) return;

    setBranchs(snapshotBranchs.docs.map(doc => ({...doc.data(), id: doc.id })) as Branch[]);

    return () => {
      mounted = false;
    }
  }, [snapshotBranchs, loadingBranchs]);

  return { loadingBranchs, branchs, columns, branch, open, setOpen, setBranch, search, setSearch };
}

export default useBranchs;