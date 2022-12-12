import { useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getFirestore, collection, query, orderBy, where, DocumentData, Query, limit, Timestamp } from 'firebase/firestore';
import useOnSnapshot from "../hooks/useOnSnapshot";
import { Campaign, Client, Cobrador, FilterSale, Sale, Team, UserFirestore, UserFirestoreAuth } from "../interfaces";
import { del, update } from '../services/firebase';
import { dayjsToStartDay, dialogDeleteDoc } from '../utils';
import { useAuth } from '../context/AuthContext';
import dayjs from "dayjs";
import ExcelJS from 'exceljs';
import useCollection from './useCollection';
import { endDateEndDay, startDateStartDay } from '../constants';

const db = getFirestore();
const columnsWorksheet = [
  { header: 'VENDEDOR', key: 'seller', width: 32 },
  { header: 'PROCESO', key: 'processUser', width: 32 },
  { header: 'FECHA / HORA CREADA', key: 'date',  width: 22  },
  { header: 'FECHA / HORA PAGO', key: 'datePayment',  width: 22  },
  { header: 'FECHA / HORA CONCLUIDA', key: 'dateConclued',  width: 22  },
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

const getQuerySales = (filter: FilterSale, userFirestore: UserFirestoreAuth) => {
  const { startDate, endDate, concluded, userId, esid, processUser, campaignId, teamId, statusLight, typeDate } = filter;

  let Query = query(
    collection(db, "sales"), 
  )

  if(concluded !== "") {
    Query = query(Query, where('concluded', '==', concluded), orderBy(typeDate));
  }

  if(((concluded || concluded === "") && !esid) || (esid && startDate && endDate)) {
    Query = query(
      Query,
      where(typeDate, ">=", startDate ? dayjsToStartDay(startDate).toDate() : startDateStartDay),
      where(typeDate, "<=", endDate ? dayjsToStartDay(endDate).toDate() : endDateEndDay)
    )
  }

  if(userFirestore?.role === "Procesos" && (concluded === null || concluded)) {
    Query = query(Query, where('userId', '==', userFirestore.id));
  } else if(userId) {
    Query = query(Query, where('userId', '==', userId));
  }
  
  if(esid) {
    Query = query(Query, where('esid', '==', esid));
  }

  if(processUser) 
    Query = query(Query, where('processUser', '==', processUser));
  
  if(campaignId) 
    Query = query(Query, where('campaign', '==', campaignId));
  
  if(teamId) {
    Query = query(Query, where('team', '==', teamId));
  }
  
  if(statusLight) {
    Query = query(Query, where('statusLight', '==', statusLight));
  }

  console.log(Query)
  
  return Query;
}

const getQueryClients = (searchESID: string, field: string) => {
  let Query = query(collection(db, "clients"));

  searchESID
    ? Query = query(Query, where(field, '==', searchESID))
    : Query = query(Query, orderBy("client"), limit(limitClients));

  return Query;
}

const useUsers = () => {
  const { userFirestore, user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale | null>(null);
  let [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filter, setFilter] = useState<FilterSale>({
    concluded: false,
    startDate: null,
    endDate: null,
    userId: ["Administrador", "Procesos"].includes(userFirestore?.role as string) ? "" : user?.uid,
    statusPayment: "",
    campaignId: "",
    teamId: "",
    statusLight: "",
    typeDate: "date",
    fieldsClient: "esid",
  });
  const [querySales, setQuerySales] = useState<Query<DocumentData>>(getQuerySales(filter, userFirestore as UserFirestoreAuth));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [queryCobradores] = useState<Query<DocumentData>>(query(collection(db, "cobradores"), orderBy("name")));
  const [queryClients, setQueryClients] = useState<Query<DocumentData>>(getQueryClients("", filter.fieldsClient));
  const [queryCampaigns] = useState<Query<DocumentData>>(query(collection(db, "campaigns"), orderBy("name")));
  const [queryTeams] = useState<Query<DocumentData>>(query(collection(db, "teams"), orderBy("name")));

  const [snapshotSales, loadingSales] = useOnSnapshot(querySales); 
  const [snapshotUsers, loadingUsers] = useCollection(queryUsers); 
  const [snapshotCobradores, loadingCobradores] = useCollection(queryCobradores); 
  const [snapshotClients, loadingClients] = useCollection(queryClients); 
  const [snapshotCampaigns, loadingCampaigns] = useCollection(queryCampaigns); 
  const [snapshotTeams, loadingTeams] = useCollection(queryTeams);

  console.log(snapshotSales?.docs.length)

  const columns = [
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
      title: 'Vendedor',
      key: 'seller',
      render: (record: Sale) => {
        const user = users.find(user =>  user.id === record.userId);

        return (
          <>
            <div> Nombre: { user?.name }</div>
            <div> Correo: { user?.email }</div>    
            <div> Equipo: { record?.team || user?.team }</div>        
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
            <div> { user?.name }</div>
          </>
        )
      }
    },
    {
      title: 'Fecha / Hora creada',
      key: 'date',
      render: (record: Sale) => <div>{dayjs(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Fecha / Hora pago',
      key: 'datePayment',
      render: (record: Sale) => record.datePayment && <div>{dayjs(record.datePayment?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Fecha / Hora concluida',
      key: 'dateConclued',
      render: (record: Sale) => record.dateConclued && <div>{dayjs(record.dateConclued?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
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
      title: userFirestore?.role === "Administrador" ? 'Eliminar' : '',
      key: 'delete',
      render: (record: Sale) => userFirestore?.role === "Administrador" && (
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
    if(!userFirestore) return;

    const query = getQuerySales(filter, userFirestore);
    
    console.log(query);
    setQuerySales(query);
  }, [filter, userFirestore]);
      
  useEffect(() => {
    let mounted = true;

    if(loadingUsers || loadingSales || loadingCobradores || loadingTeams || !mounted) return;

    let _sales = snapshotSales?.docs.map(doc => ({...doc.data(), id: doc.id })) as Sale[]

    setSales(_sales);
    setUsers(snapshotUsers.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[]);
    setCobradores(snapshotCobradores.docs.map(doc => ({...doc.data(), id: doc.id })) as Cobrador[]);
    setClients(snapshotClients.docs.map(doc => ({...doc.data(), id: doc.id })) as Client[]);
    setCampaigns(snapshotCampaigns.docs.map(doc => ({...doc.data(), id: doc.id })) as Campaign[]);
    setTeams(snapshotTeams.docs.map(doc => ({...doc.data(), id: doc.id })) as Team[]);

    return () => {
      mounted = false;
    }
  }, [
    snapshotSales, 
    snapshotUsers, 
    snapshotCobradores, 
    snapshotClients, 
    snapshotCampaigns,
    snapshotTeams,
    loadingSales, 
    loadingUsers, 
    loadingCobradores, 
    loadingClients, 
    loadingCampaigns,
    loadingTeams,
    userFirestore,
    user
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

    if(filter.statusPayment !== null) {
      sales = sales.filter(s => filter.statusPayment ? s.paymentAmount : !s.paymentAmount);
    }

    let _sales = sales.map(sale => ({
      ...sale,
      seller: users.find(user => user.id === sale.userId)?.name.toUpperCase(),
      processUser: users.find(user => user.email === sale.processUser)?.name.toUpperCase(),
      date: dayjs(sale.date?.toDate()).format("DD/MM/YYYY hh:mm a"),
      datePayment: sale.datePayment ? dayjs(sale.datePayment?.toDate()).format("DD/MM/YYYY hh:mm a") : "",
      dateConclued: sale.dateConclued ? dayjs(sale.dateConclued?.toDate()).format("DD/MM/YYYY hh:mm a") : "",
      status: sale.concluded ? "Concluida" : "Pendiente".toUpperCase(),
      emailSeller: users.find(user => user.id === sale.userId)?.email.toUpperCase(),
      team: users.find(user => user.id === sale.userId)?.team.toUpperCase(),
      client: sale.client.toUpperCase(),
      dateBirth: dayjs(sale.dateBirth?.toDate()).format("DD/MM/YYYY"),
      address: sale.address.toUpperCase(),
      email: sale.email?.toUpperCase(),
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

  const onSearchClients = (value: string) => setQueryClients(getQueryClients(value, filter.fieldsClient));

  return { 
    loadingUsers, 
    loadingSales, 
    loadingCampaigns,
    loadingTeams,
    users, 
    sales, 
    clients, 
    teams,
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