import { useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, where, DocumentData, Query, limit, Timestamp } from 'firebase/firestore';
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
const columnsWorksheet = [
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
  { header: 'RECIBE', key: 'receives',  width: 32  },
  { header: 'ENVIA', key: 'sends',  width: 32  },
  { header: 'VIVIENDA', key: 'livingPlace',  width: 16  },
  { header: 'COMPAÑIA ANTERIOR', key: 'previousCompany',  width: 32  },
  { header: 'CANTIDAD DE COBRO', key: 'paymentAmount',  width: 22 },
  { header: 'COMISIÓN', key: 'comision' },
  { header: 'CAMPAÑA', key: 'campaign', width: 18 },
  { header: 'NOTAS', key: 'notes' },
];
const columnsExcel = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const limitClients = 10;

StartDate.set({ hour:0, minute:0, second:0, millisecond:0});
EndDate.set({ hour:24, minute:59, second:59, millisecond:59});

const getQuerySales = (filter: FilterSale) => {
  const { startDate, endDate, concluded, userId, esid, processUser, campaignId, teamId, statusLight } = filter;

  let Query = query(
    collection(db, "sales"), 
  )

  if(concluded !== null) {
    Query = query(Query, where('concluded', '==', concluded), orderBy("date"));
  }

  if(concluded || concluded === null) {
    Query = query(
      Query,
      where("date", ">=", startDate ? startDate.toDate() : StartDate.toDate()),
      where("date", "<=", endDate ? endDate.toDate() : EndDate.toDate())
    )
  }

  console.log(userId)
  
  if(userId) 
    Query = query(Query, where('userId', '==', userId));

  if(esid)
    Query = query(Query, where('esid', '==', esid));

  if(processUser) 
    Query = query(Query, where('processUser', '==', processUser));
  
  if(campaignId) 
    Query = query(Query, where('campaign', '==', campaignId));
  
  if(teamId) 
    Query = query(Query, where('team', '==', teamId));
  
  if(statusLight) {
    Query = query(Query, where('statusLight', '==', statusLight));
  }

  return Query;
}

const getQueryClients = (searchESID: string) => {
  let Query = query(collection(db, "clients"));

  searchESID
    ? Query = query(Query, orderBy("esid"), where('esid', '>=', searchESID))
    : Query = query(Query, orderBy("client"), limit(limitClients));

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
    userId: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? "" : user?.uid,
    statusPayment: null,
    campaignId: "",
    teamId: "",
    statusLight: "",
  });
  const [querySales, setQuerySales] = useState<Query<DocumentData>>(getQuerySales(filter));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [queryClients, setQueryClients] = useState<Query<DocumentData>>(getQueryClients(""));
  const [queryCampaigns] = useState<Query<DocumentData>>(query(collection(db, "campaigns"), orderBy("name")));
  const [snapshotSale, loadingSales] = useOnSnapshot(querySales); 
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers); 
  const [snapshotCobradores, loadingCobradores] = useOnSnapshot(queryCobradores); 
  const [snapshotClients, loadingClients] = useOnSnapshot(queryClients); 
  const [snapshotCampaigns, loadingCampaigns] = useOnSnapshot(queryCampaigns); 

  const columns = [
  /*   {
      title: 'Pago',
      key: 'paymentAmount',
      dataIndex: 'paymentAmount',
      render: (text: string) => text
    }, */
    {
      title: 'Cliente',
      key: 'client',
      dataIndex: 'client',
      render: (text: string) => text
    },
    {
      title: 'Vendedor',
      key: 'seller',
      render: (record: Sale) => {
        const user = users.find(user =>  user.id === record.userId);

        return (
          <>
            <div> Nombre:  { user?.name }</div>
            <div> Correo: { user?.email }</div>    
            <div> Equipo: { record?.team || user?.team  }</div>        
          </>
        )
      }
    },
    {
      title: 'Campaña',
      key: 'campaign',
      dataIndex: 'campaign',
      render: (text: string) => campaigns.find(c => c.id === text)?.name
    },
    {
      title: 'Equipo',
      key: 'team',
      render: (record: Sale) => {
        if(record.team) {
          return record.team;
        }

        const user = users.find(user =>  user.id === record.userId);
        return user?.team;            
      }
    },
    {
      title: 'Estatus venta',
      key: 'statusSale',
      dataIndex: 'statusSale',
      render: (text: string) => text
    },
    {
      title: 'Estatus luz',
      key: 'statusLight',
      dataIndex: 'statusLight',
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
              onChange={async (checket) => await update("sales", record.id as string, {concluded: checket, dateConclued: checket ? Timestamp.now() : null})}
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
      title: 'Proceso',
      key: 'processUser',
      render: (record: Sale) => {
        const user = users.find(user =>  user.email === record.processUser);
        return (
          user?.email && <>
            <div> Nombre:  { user?.name }</div>
            <div> Correo: { user?.email }</div>
            <div> Equipo: { user?.team }</div>
          </>
        )
      }
    },
    {
      title: 'Fecha / Hora creada',
      key: 'date',
      render: (record: Sale) => <div>{moment(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Fecha / Hora pago',
      key: 'date',
      render: (record: Sale) => record.datePayment && <div>{moment(record.datePayment?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Fecha / Hora concluida',
      key: 'date',
      render: (record: Sale) => record.dateConclued && <div>{moment(record.dateConclued?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
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
    }
  ];

  useEffect(() => {
    setQuerySales(getQuerySales(filter));
  }, [filter]);
      
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
  }, [
    snapshotSale, 
    snapshotUsers, 
    snapshotCobradores, 
    snapshotClients, 
    snapshotCampaigns, 
    loadingSales, 
    loadingUsers, 
    loadingCobradores, 
    loadingClients, 
    loadingCampaigns
  ]);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de ventas');

    worksheet.columns = columnsWorksheet;

    columnsExcel.forEach(column => {
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
      address: sale.address.toUpperCase(),
      email: sale.email.toUpperCase(),
      additionalEmail: sale.additionalEmail?.toUpperCase(),
      statusSale: sale.statusSale?.toUpperCase(),
      statusLight: sale.statusLight.toUpperCase(),
      paymentMethod: sale.paymentMethod?.toUpperCase(),
      sends: sale.sends.toUpperCase(),
      receives: sale.receives.toUpperCase(),
      livingPlace: sale.livingPlace.toUpperCase(),
      previousCompany: sale.previousCompany.toUpperCase(),
      paymentAmount: `$${Number(sale?.paymentAmount || 0).toFixed(2)}`,
      comision: "$20.00",
      campaign: campaigns.find(campaign => campaign.id === sale.campaign)?.name.toUpperCase(),
      notes: sale.notes.toUpperCase(),
    }));

    worksheet.addRows(_sales);

    const data =  await workbook.xlsx.writeBuffer();
    const blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    
    document.body.appendChild(a);

    a.href = url;
    a.download = "Reporte de ventas.xlsx";
    a.click();
  }

  const onSearchClients = (value: string) => setQueryClients(getQueryClients(value));

  return { 
    loadingUsers, 
    loadingSales, 
    loadingCampaigns,
    users, 
    sales, 
    clients, 
    columns, 
    sale, 
    open, 
    setOpen, 
    setSale, 
    filter, 
    setFilter, 
    cobradores, 
    downloadExcel, 
    campaigns, 
    onSearchClients 
  };
}

export default useUsers;