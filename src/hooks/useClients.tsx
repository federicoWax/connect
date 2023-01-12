import { useEffect, useMemo, useState } from 'react';
import { Button, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query, limit, startAfter, startAt } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Client, Cobrador } from "../interfaces";
import { del, getDocById } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
import { endAt } from 'firebase/firestore/lite';

const db = getFirestore();

const useClients = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [notGetMore, setNotGetMore] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("esid");
  const [client, setClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [queryClients, setQueryClients] = useState<Query<DocumentData>>(query(collection(db, "clients"), orderBy(filter), limit(8)));
  
  const queryCobradores = useMemo<Query<DocumentData>>(() => query(collection(db, "cobradores"), orderBy("name")), []);

  const [snapshotUsers, loadingClients] = useOnSnapshot(queryClients, true); 
  const [snapshotCobradores, loadingCobradores] = useOnSnapshot(queryCobradores);

  const columns = useMemo(() => [
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
  ], []);
      
  useEffect(() => {
    if(loadingClients || loadingCobradores) return;

    const _clients = snapshotUsers?.docs.map(doc => ({...doc.data(), id: doc.id})) as Client[];
    
    if(!_clients.length) {
      setNotGetMore(true);
    }

    setClients(c => [...c, ..._clients]);
    setCobradores(snapshotCobradores?.docs.map(doc => ({...doc.data(), id: doc.id })) as Cobrador[]);
  }, [snapshotUsers, snapshotCobradores, loadingClients, loadingCobradores]);

  const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if(notGetMore || loadingClients) return;

    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const bottom = (scrollHeight - scrollTop) < clientHeight;

    if (!bottom) return;

    try {
      const lastDoc = await getDocById("clients", clients[clients.length - 1]?.id as string);

      if(!lastDoc.exists()) return;

      if(!search) {
        setQueryClients(query(collection(db, "clients"), orderBy(filter), limit(8), startAfter(lastDoc)));
        return;
      }

      setQueryClients(query(collection(db, "clients"), orderBy(filter), startAt(search), endAt(search + "\uf8ff"), limit(8), startAfter(lastDoc)));
    } catch (error) {
      console.log(error);
      message.error("Error al obtener los clientes.");
    } 
  }

  const onSearch = () => {
    if(loadingClients) return;

    setClients([]);
    setNotGetMore(false);

    if(!search) {
      setQueryClients(query(collection(db, "clients"), orderBy(filter), limit(8)));
      return;
    }

    setQueryClients(query(collection(db, "clients"), orderBy(filter), startAt(search), endAt(search + "\uf8ff"), limit(8)));
  }

  return { loadingClients, clients, columns, client, open, setOpen, cobradores, search, setSearch, onScroll, filter, setFilter, onSearch };
}

export default useClients;