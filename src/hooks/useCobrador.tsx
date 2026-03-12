import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";
import { Cobrador } from "../interfaces";
import { del } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
import useMessage from "./useMessage";

const db = getFirestore();

const useColaboradores = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [cobrador, setCobrador] = useState<Cobrador | null>(null);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [snapshotCobrador, loadingCobradores] = useOnSnapshot(queryCobradores);
  const message = useMessage();

  const columns = [
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

            dialogDeleteDoc(deleteUser, message);
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

  useEffect(() => {
    let mounted = true;

    if (loadingCobradores || !mounted) return;

    setCobradores(snapshotCobrador?.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Cobrador[]);

    return () => {
      mounted = false;
    };
  }, [snapshotCobrador, loadingCobradores]);

  return { loadingCobradores, cobradores, columns, cobrador, open, setOpen, setCobrador };
};

export default useColaboradores;