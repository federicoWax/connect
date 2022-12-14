import { useMemo, useState } from "react";
import { Button, Table } from "antd";
import { useAuth } from "../../context/AuthContext";
import ExcelDialog from "./excelDialog";
import { Excel } from "../../interfaces";
import { collection, DocumentData, query, Query, getFirestore, orderBy, where } from "firebase/firestore";
import useOnSnapshot from "../../hooks/useOnSnapshot";
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { dialogDeleteDoc } from "../../utils";
import { del, deleteFile } from "../../services/firebase";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

const Excels = () => {
  const { userFirestore } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [excel, setExcel] = useState<Excel | null>(null);
  
  const queryExceles = useMemo<Query<DocumentData>>(() => {
    if(userFirestore?.role === "Administrador") {
      return query(collection(db, "exceles"), orderBy("name"));
    }

    return query(collection(db, "exceles"), where("userIds", "array-contains", userFirestore?.id), orderBy("name"));
  }, [userFirestore]);
  const [snapExceles, loadingExceles] = useOnSnapshot(queryExceles); 
  
  const exceles = useMemo<Excel[]>(() => {
    return snapExceles?.docs.map(doc => ({...doc.data(), id: doc.id})) as Excel[] || []
  }, [snapExceles]);

  const columns = [
    {
      title: 'Nombre',
      key: 'name',
      dataIndex: 'name',
      render: (text: string) => text
    },
    {
      title: 'Ver',
      key: 'delete',
      render: (record: Excel) => (
        <Button 
          shape="circle" 
          icon={<EyeOutlined />}
          onClick={() => navigate("/exceles/" + record.id)}
        />
      )
    },
    {
      title: 'Editar',
      key: 'edit',
      render: (record: Excel) => (
        <Button 
          shape="circle" 
          icon={<EditOutlined />}
          onClick={() => {
            setOpen(true);
            setExcel(record);
          }} 
        />
      )
    },
    {
      title: 'Eliminar',
      key: 'delete',
      render: (record: Excel) => (
        <Button 
          shape="circle" 
          icon={<DeleteOutlined />}
          onClick={async () => {
            const deleteExcel = () => del("exceles", record.id as string);
  
            const deleted = await dialogDeleteDoc(deleteExcel);
          
            if(deleted) {
              await deleteFile(record?.file as string);
            }
          }}
        />
      )
    },
  ];

  console.log(userFirestore)

  return (
    <div>
      <h1>Exceles</h1>
      {
        (userFirestore?.role === "Administrador" || userFirestore?.permissions.some(p => p.module === "Exceles" && p.write)) && <Button
          style={{ float: "right", marginBottom: 10 }}
          type="primary"
          onClick={() => setOpen(true)}
        >
          Agregar excel
        </Button>
      }
      <Table
        style={{ overflowX: "auto", backgroundColor: "white" }}
        loading={loadingExceles}
        columns={columns}
        pagination={false}
        dataSource={exceles.map(s => ({ ...s, key: s.id }))} locale={{ emptyText: "Sin exceles..." }}
      />
      <ExcelDialog 
        open={open}
        propExcel={excel}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default Excels;