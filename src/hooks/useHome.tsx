import { useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, where, DocumentData, Query } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Campaign, Client, Cobrador, FilterSale, Sale, UserFirestore } from "../interfaces";
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
  const { startDate, endDate, concluded, userId, esid, processUser } = filter;

  let Query = query(
    collection(db, "sales"), 
    orderBy('date'), 
    where('concluded', '==', concluded),
  )

  if(filter.concluded) {
    Query = query(
      Query,
      where("date", ">=", startDate ? startDate.toDate() : StartDate.toDate()),
      where("date", "<=", endDate ? endDate.toDate() : EndDate.toDate())
    )
  }
  
  if(userId) 
    Query = query(Query, where('userId', '==', userId));

  if(esid)
    Query = query(Query, where('esid', '==', esid));

  if(processUser) 
    Query = query(Query, where('processUser', '==', processUser));

  return Query;
}

const useUsers = () => {
  const { userFirestore, user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<FilterSale>({
    concluded: false,
    startDate: null,
    endDate: null,
    userId: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? "" : user?.uid
  });
  const [querySales, setQuerySales] = useState<Query<DocumentData>>(getQuery(filter));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [queryClients] = useState<Query<DocumentData>>(query(collection(db, "clients"), orderBy("client")));
  const [queryCampaigns] = useState<Query<DocumentData>>(query(collection(db, "campaigns"), orderBy("name")));

  const [snapshotSale, loadingSales] = useOnSnapshot(querySales); 
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers); 
  const [snapshotCobradores, loadingCobradores] = useOnSnapshot(queryCobradores); 
  const [snapshotClients, loadingClients] = useOnSnapshot(queryClients); 
  const [snapshotCampaigns, loadingCampaigns] = useOnSnapshot(queryCampaigns); 

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
    {
      title: 'Proceso',
      key: 'processUser',
      render: (record: Sale) => {
        const user = users.find(user =>  user.email === record.processUser);
        return (
          <>
            <div> Nombre:  { user?.name }</div>
            <div> Correo: { user?.email }</div>
            <div> Equipo: { user?.team }</div>
          </>
        )
      }
    },
    {
      title: 'Fecha / Hora',
      key: 'date',
      render: (record: Sale) => <div>{moment(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Estatus venta',
      key: 'statusSale',
      dataIndex: 'statusSale',
      render: (text: string) => text
    },
    {
      title: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? 'Concluida / Pendiente' : '',
      key: 'concluded',
      render: (record: Sale) => (
        <>
          {record.concluded ? "Concluida" : "Pendiente"}
          <br />
          {
            ["Administrador", "Procesos"].includes(userFirestore?.role as string) && userFirestore?.email === record.processUser && <Switch 
            checked={record.concluded}
            onChange={async (checket) => await update("sales", record.id as string, {concluded: checket})}
            />
          }
        </>
      )
    },
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
      title: 'Estatus luz',
      key: 'statusLight',
      dataIndex: 'statusLight',
      render: (text: string) => text
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
    setClients(snapshotClients.docs.map(doc => ({...doc.data(), id: doc.id })) as Client[]);
    setCampaigns(snapshotCampaigns.docs.map(doc => ({...doc.data(), id: doc.id })) as Campaign[]);

    return () => {
      mounted = false;
    }
  }, [snapshotSale, snapshotUsers, snapshotCobradores, snapshotClients, snapshotCampaigns, loadingSales, loadingUsers, loadingCobradores, loadingClients, loadingCampaigns]);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de ventas');

    worksheet.columns = [
      { header: 'VENDEDOR', key: 'seller', width: 32 },
      { header: 'PROCESO', key: 'processUser', width: 32 },
      { header: 'FECHA / HORA', key: 'date',  width: 22  },
      { header: 'CONCLUIDA / PENDIENTE', key: 'status', width: 22 },
      { header: 'CORREO VENDEDOR', key: 'emailSeller',  width: 32  },
      { header: 'EQUIPO', key: 'team'  },
      { header: 'CLIENTE', key: 'client',  width: 32  },
      { header: 'FECHA DE NACIMIENTO', key: 'dateBirth',  width: 18  },
      { header: 'TELÉFONO', key: 'phone',  width: 16  },
      { header: 'TELÉFONO ADICIONAL', key: 'additionalPhone',  width: 16  },
      { header: 'ESID', key: 'esid',  width: 32  },
      { header: 'DIRECCIÓN', key: 'address',  width: 40  },
      { header: 'CORREO ELECTRÓNICO', key: 'email',  width: 32  },
      { header: 'CORREO ELECTRÓNICO ADICIONAL', key: 'additionalEmail',  width: 32  },
      { header: 'ESTATUS DE VENTA', key: 'statusSale', width: 16 },
      { header: 'ESTATUS LUZ', key: 'statusLight' },
      { header: 'MÉTODO DE PAGO', key: 'paymentMethod', width: 16 },
      { header: 'NÚMERO DE REFERENCIA', key: 'referenceNumber',  width: 22  },
      { header: 'RECIBE', key: 'sends',  width: 32  },
      { header: 'ENVIA', key: 'receives',  width: 32  },
      { header: 'VIVIENDA', key: 'livingPlace',  width: 16  },
      { header: 'COMPAÑIA ANTERIOR', key: 'previousCompany',  width: 32  },
      { header: 'CANTIDAD DE COBRO', key: 'paymentAmount',  width: 22 },
      { header: 'COMISIÓN', key: 'comision' },
      { header: 'CAMPAÑA', key: 'campaign', width: 18 },
      { header: 'NOTAS', key: 'notes' },
    ];

    const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    //, "AA", "AB", "AC", "AD" , "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ"];

    columns.forEach(column => {
      worksheet.getCell(column + '1').font = {
        bold: true
      };
    })

    const _sales = sales.map(sale => ({
      ...sale,
      seller: users.find(user => user.id === sale.userId)?.name.toUpperCase(),
      processUser: sale.processUser?.toUpperCase(),
      date: moment(sale.date?.toDate()).format("DD/MM/YYYY hh:mm a"),
      status: sale.concluded ? "Concluida" : "Pendiente".toUpperCase(),
      emailSeller: users.find(user => user.id === sale.userId)?.email.toUpperCase(),
      team: users.find(user => user.id === sale.userId)?.team.toUpperCase(),
      client: sale.client.toUpperCase(),
      dateBirth: moment(sale.dateBirth?.toDate()).format("DD/MM/YYYY"),
      address: sale.address?.toUpperCase(),
      email: sale.email?.toUpperCase(),
      additionalEmail: sale.additionalEmail?.toUpperCase(),
      statusSale: sale.statusSale?.toUpperCase(),
      statusLight: sale.statusLight?.toUpperCase(),
      paymentMethod: sale.paymentMethod?.toUpperCase(),
      sends: sale.sends?.toUpperCase(),
      receives: cobradores.find(cobrador => cobrador.id === sale.receives)?.name.toUpperCase() || "",
      livingPlace: sale.livingPlace?.toUpperCase(),
      previousCompany: sale.previousCompany?.toUpperCase(),
      paymentAmount: `$${Number(sale?.paymentAmount || 0).toFixed(2)}`,
      comision: "$20.00",
      campaign: campaigns.find(campaign => campaign.id === sale.campaign)?.name.toUpperCase(),
      notes: sale.notes?.toUpperCase(),
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

  return { loadingUsers, loadingSales, users, sales, clients, columns, sale, open, setOpen, setSale, filter, setFilter, cobradores, downloadExcel, campaigns };
}

export default useUsers;