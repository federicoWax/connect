import { useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, where, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Cobrador, FilterSale, Sale, UserFirestore } from "../interfaces";
import { del, update } from '../services/firebase';
import { dialogDeleteDoc } from '../utils';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import ExcelJS from 'exceljs';

const db = getFirestore();
const StartDate = moment();
const EndDate = moment();

StartDate.set({ hour:0, minute:0, second:0, millisecond:0});
EndDate.set({ hour:24, minute:59, second:59, millisecond:59});


const getQuery = (filter: FilterSale) => {
  const { startDate, endDate, concluded, userId } = filter;

  let Query = query(
    collection(db, "sales"), 
    orderBy('date'), 
    where('concluded', '==', concluded),
    where("date", ">=", startDate ? startDate.toDate() : StartDate.toDate()), 
    where("date", "<=", endDate ? endDate.toDate(): EndDate.toDate())
  )
  
  if(userId) 
    Query = query(Query, where('userId', '==', userId));

  return Query;
}

const useUsers = () => {
  const { userFirestore, user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [filter, setFilter] = useState<FilterSale>({
    concluded: false,
    startDate: null,
    endDate: null,
    userId: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? "" : user?.uid
  });
  const [querySales, setQuerySales] = useState<Query<DocumentData>>(getQuery(filter));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [snapshotSale, loadingSales] = useOnSnapshot(querySales); 
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers); 
  const [snapshotCobradores, loadingCobradores] = useOnSnapshot(queryCobradores); 
  const columns = [
    {
      title: 'Vendedor',
      key: 'seller',
      render: (record: Sale) => {
        const user = users.find(user =>  user.id === record.userId);
        return (
          <>
            <div> Nombre:  { user?.name }</div>
            <div> Correo: { user?.email }</div>
            <div> Equipo: { user?.team }</div>
          </>
        )
      }
    },
   /*  {
      title: 'id',
      key: 'id',
      dataIndex: 'id',
      render: (text: string) => text
    }, */
    {
      title: 'Cliente',
      key: 'client',
      dataIndex: 'client',
      render: (text: string) => text
    },
    {
      title: 'Estatus luz',
      key: 'statusLight',
      dataIndex: 'statusLight',
      render: (text: string) => text
    },
    {
      title: 'Fecha / Hora',
      key: 'date',
      render: (record: Sale) => <div>{moment(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? 'Concluida' : '',
      key: 'concluded',
      render: (record: Sale) => (
        ["Administrador", "Procesos"].includes(userFirestore?.role as string) && <Switch 
          checked={record.concluded}
          onChange={async (checket) => await update("sales", record.id as string, {concluded: checket})}
        />
      )
    },
    {
      title: 'Eliminar',
      key: 'delete',
      render: (record: Sale) => (
        <Button 
          shape="circle" 
          icon={<DeleteOutlined />}
          onClick={() => {
            const deleteUser = () => del("sales", record.id as string);
  
            dialogDeleteDoc(deleteUser);
          }}
        />
      )
    },
    {
      title: 'Editar',
      key: 'edit',
      render: (sale: Sale) => (
        <Button 
          shape="circle" 
          icon={<EditOutlined />}
          onClick={() => {
            setOpen(true);
            setSale(sale);
          }} 
        />
      )
    },
  ];

  useEffect(() => {
    setQuerySales(getQuery(filter));
  }, [filter, userFirestore, user]);
      
  useEffect(() => {
    let mounted = true;

    if(loadingUsers || loadingSales || loadingCobradores || !mounted) return;

    setSales(snapshotSale.docs.map(doc => ({...doc.data(), id: doc.id })) as Sale[]);
    setUsers(snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);
    setCobradores(snapshotCobradores.docs.map(doc => ({...doc.data(), id: doc.id })) as Cobrador[]);

    return () => {
      mounted = false;
    }
  }, [snapshotSale, snapshotUsers, snapshotCobradores, loadingSales, loadingUsers, loadingCobradores]);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de ventas');

    worksheet.columns = [
      { header: 'Vendedor', key: 'seller' },
      { header: 'Correo Vendedor', key: 'emailSeller' },
      { header: 'Equipo', key: 'team' },
      { header: 'Cliente', key: 'client' },
      { header: 'Fecha / Hora', key: 'date' },
      { header: 'Teléfono', key: 'phone' },
      { header: 'Teléfono adicional', key: 'additionalPhone' },
      { header: 'ESID', key: 'esid' },
      { header: 'Dirreción', key: 'address' },
      { header: 'Correo electrónico', key: 'email' },
      { header: 'Correo electrónico adicional', key: 'additionalEmail' },
      { header: 'Estatus de venta', key: 'statusSale' },
      { header: 'Estatus luz', key: 'statusLight' },
      { header: 'Método de pago', key: 'paymentMethod' },
      { header: 'Número de referencia', key: 'referenceNumber' },
      { header: 'Recibe', key: 'sends' },
      { header: 'Envia', key: 'receives' },
      { header: 'Vivienda', key: 'livingPlace' },
      { header: 'Compañia anterior', key: 'previousCompany' },
    ];

    const _sales = sales.map(sale => ({
      ...sale, 
      seller: users.find(user => user.id === sale.userId)?.name,
      emailSeller: users.find(user => user.id === sale.userId)?.email,
      team: users.find(user => user.id === sale.userId)?.team,
      receives: cobradores.find(cobrador => cobrador.id === sale.receives)?.name || "",
      date: moment(sale.date?.toDate()).format("DD/MM/YYYY hh:mm a"),
      statusSale: sale.concluded ? "Concluida" : "Pendiente",
    }));

    worksheet.addRows(_sales);

    const data =  await workbook.xlsx.writeBuffer();
    
    var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "Reporte de ventas.xlsx";
    a.click();
  }

  return { loadingUsers, loadingSales, users, sales, columns, sale, open, setOpen, setSale, filter, setFilter, cobradores, downloadExcel };
}

export default useUsers;