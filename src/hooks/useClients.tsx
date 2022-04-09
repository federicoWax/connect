import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Client, Cobrador } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';

const db = getFirestore();

const useClients = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [queryClients] = useState<Query<DocumentData>>(query(collection(db, "clients"), orderBy('client')));

  const [snapshotUsers, loadingClients] = useOnSnapshot(queryClients); 
  const [snapshotCobradores, loadingCobradores] = useOnSnapshot(queryCobradores);

  const columns = [
    {
      title: 'ESID',
      key: 'esid',
      dataIndex: 'esid',
      render: (text: string) => text
    },
    {
      title: 'Cliente',
      key: 'client',
      dataIndex: 'client',
      render: (text: string) => text
    },
    {
      title: 'Teléfono',
      key: 'phone',
      dataIndex: 'phone',
      render: (text: string) => text
    },
    {
      title: 'Correo electrónico',
      key: 'email',
      dataIndex: 'email',
      render: (text: string) => text
    },
    {
      title: 'Dirreción',
      key: 'address',
      dataIndex: 'address',
      render: (text: string) => text
    },
    {
      title: 'Estatus luz',
      key: 'statusLight',
      dataIndex: 'statusLight',
      render: (text: string) => text
    },
    {
      title: 'Eliminar',
      key: 'delete',
      render: (record: Client) => (
        <Button 
          shape="circle" 
          icon={<DeleteOutlined />}
          onClick={() => {
            const delFun = () => del("clients", record.id as string);
  
            dialogDeleteDoc(delFun);
          }}
        />
      )
    },
    {
      title: 'Editar',
      key: 'edit',
      render: (client: Client) => (
        <Button 
          shape="circle" 
          icon={<EditOutlined />}
          onClick={() => {
            setOpen(true);
            setClient(client);
          }} 
        />
      )
    },
  ];
      
  useEffect(() => {
    let mounted = true;

    if(loadingClients || loadingCobradores || !mounted) return;

    setClients(snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as Client[]);
    setCobradores(snapshotCobradores.docs.map(doc => ({...doc.data(), id: doc.id })) as Cobrador[]);

    return () => {
      mounted = false;
    }
  }, [snapshotUsers, snapshotCobradores, loadingClients, loadingCobradores]);


  return { loadingClients, clients, columns, client, open, setOpen, cobradores, search, setSearch };
}

export default useClients;