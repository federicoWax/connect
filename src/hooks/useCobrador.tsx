import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";
import { Cobrador } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
const db = getFirestore();

const getColumns = (
  setCobrador: React.Dispatch<React.SetStateAction<Cobrador | null>>, 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>, 
) => [
  {
    title: 'Cobrabor',
    key: 'name',
    dataIndex: 'name',
    render: (text: string) => text
  },
  
  {
    title: 'Eliminar',
    key: 'delete',
    render: (record: Cobrador) => (
      <Button 
        shape="circle" 
        icon={<DeleteOutlined />}
        onClick={() => {
          const deleteUser = () => del("cobradores", record.id as string);

          dialogDeleteDoc(deleteUser);
        }}
      />
    )
  },
  {
    title: 'Editar',
    key: 'edit',
    render: (cobrador: Cobrador) => (
      <Button 
        shape="circle" 
        icon={<EditOutlined />}
        onClick={() => {
          setOpen(true);
          setCobrador(cobrador);
        }} 
      />
    )
  },
];

const useColaboradores = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [cobrador, setCobrador] = useState<Cobrador | null>(null);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [snapshotCobrador, loadingCobradores] = useOnSnapshot(queryCobradores); 
  const columns = getColumns(setCobrador, setOpen);

  useEffect(() => {
    let mounted = true;

    if( loadingCobradores || !mounted) return;

    setCobradores(snapshotCobrador.docs.map(doc => ({...doc.data(), id: doc.id })) as Cobrador[]);

    return () => {
      mounted = false;
    }
  }, [snapshotCobrador, loadingCobradores]);

  return { loadingCobradores, cobradores, columns, cobrador, open, setOpen, setCobrador };
}

export default useColaboradores;