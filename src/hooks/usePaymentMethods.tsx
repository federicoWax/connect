import { useMemo, useState, useEffect } from "react";
import { Button } from "antd";
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { dialogDeleteDoc } from '../utils';
import { del } from '../services/firebase';
import { PaymentMethod } from "../interfaces";
import { initPaymentMethod } from "../constants";
import { ColumnsType } from "antd/es/table";
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "./useOnSnapshot";

const db = getFirestore();

const usePaymentMethods = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initPaymentMethod);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const queryPaymentMethods = useMemo<Query<DocumentData>>(() => query(collection(db, "paymentMethods"), orderBy("name")), []);
  const [paymentMethodDocs, loading] = useOnSnapshot(queryPaymentMethods);

  useEffect(() => {
    if (loading) return;

    setPaymentMethods(paymentMethodDocs?.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PaymentMethod[]);
  }, [paymentMethodDocs, loading]);

  const columns = useMemo<ColumnsType<PaymentMethod>>(() => [
    {
      title: 'Metodo de pago',
      key: 'name',
      dataIndex: 'name',
      render: (text: string) => text
    },
    {
      title: 'Eliminar',
      key: 'delete',
      render: (record: PaymentMethod) => (
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => {
            const deletePaymentMethod = () => del("paymentMethods", record.id as string);

            dialogDeleteDoc(deletePaymentMethod);
          }}
        />
      )
    },
    {
      title: 'Editar',
      key: 'edit',
      render: (_paymentMethod: PaymentMethod) => (
        <Button
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => {
            setOpen(true);
            setPaymentMethod(_paymentMethod);
          }}
        />
      )
    },
  ], []);

  return (
    {
      open,
      setOpen,
      columns,
      loading,
      paymentMethods,
      paymentMethod
    }
  );
};

export default usePaymentMethods;