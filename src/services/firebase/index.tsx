import { message, Modal } from "antd";
import { doc, getDoc, deleteDoc, getFirestore } from "firebase/firestore";
import { ExclamationCircleOutlined } from '@ant-design/icons';

const db = getFirestore()

export const getDocById = (collection: string, id: string) => getDoc(doc(db, collection, id)); 

export const delDoc = (collection: string, id: string) => deleteDoc(doc(db, collection, id));

export const dialogDeleteDoc = (fun: any) => {
  Modal.confirm({
    title: 'Eliminar',
    icon: <ExclamationCircleOutlined />,
    content: 'Seguro que deseas eliminar este registro?',
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    onOk: async () => {
      await fun();
      message.success("Registro eliminado con exito!");
    },
  });
}