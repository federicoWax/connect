import { collection, DocumentData, getFirestore, orderBy, query, Query, where } from "firebase/firestore";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Assistence, FilterAssists, Sale, UserFirestore } from "../interfaces";
import useOnSnapshot from "./useOnSnapshot";
import ExcelJS from 'exceljs';
import { endDateEndDay, startDateStartDay } from "../constants";

const db = getFirestore();
const columnsExcel = ["A", "B", "C"];
const columnsWorksheet = [
  { header: 'USUARIO', key: 'user', width: 32 },
  { header: 'FECHA', key: 'date', width: 32 },
  { header: 'TIPO DE REGISTRO', key: 'typeRegister', width: 32 },
];

const getQueryAssists = (filter: FilterAssists) => {
  const { startDate, endDate } = filter;

  const Query = query(
    collection(db, "assists"), 
    where("date", ">=", startDate ? startDate.toDate() : startDateStartDay),
    where("date", "<=", endDate ? endDate.toDate() : endDateEndDay)
  );
  
  return Query;
}

const useAssists = () => {
  const [filter, setFilter] = useState<FilterAssists>({
    startDate: null,
    endDate: null
  });
  const [queryAssists, setQueryAssists] = useState<Query<DocumentData>>(getQueryAssists(filter));
  const [queryUsers] = useState<Query<DocumentData>>(query(collection(db, "users"), orderBy('name')));
  const [snapshotAssists, loadingAssists] = useOnSnapshot(queryAssists);
  const [snapshotUsers, loadingUsers] = useOnSnapshot(queryUsers);
  const [assists, setAssists] = useState<Assistence[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if(!loadingAssists && !loadingUsers) {
      const users = snapshotUsers?.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore [];

      setAssists(
        snapshotAssists?.docs.map(doc => {
          const user = users.find(u => u.id === doc.data().userId);

          return ({...doc.data(), ...user, id: doc.id})
        }) as Assistence []
      );
    }
  }, [loadingAssists, loadingUsers, snapshotAssists, snapshotUsers]);

  useEffect(() => {
    setQueryAssists(getQueryAssists(filter));
  }, [filter]);

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (record: Assistence) => {
        return (
          <>
            <div> Nombre:  { record?.name }</div>
            <div> Correo: { record?.email }</div>    
            <div> Equipo: { record?.team || "" }</div>        
          </>
        )
      }
    },
    {
      title: 'Fecha',
      key: 'date',
      render: (record: Sale) => <div>{dayjs(record.date?.toDate().toString()).format("DD/MM/YYYY hh:mm a")}</div>
    },
    {
      title: 'Tipo de registro',
      key: 'typeRegister',
      dataIndex: 'typeRegister',
      render: (text: string) => text
    }
  ];

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de ventas');

    worksheet.columns = columnsWorksheet;

    columnsExcel.forEach(column => {
      worksheet.getCell(column + '1').font = {
        bold: true
      };
    })

    const _assists = assists.map(a => ({
      ...a,
      user: a.name?.toUpperCase(),
      date: dayjs(a.date?.toDate()).format("DD/MM/YYYY hh:mm a"),
      typeRegister: a.typeRegister?.toUpperCase()
    }));

    worksheet.addRows(_assists);

    const data =  await workbook.xlsx.writeBuffer();
    const blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    
    document.body.appendChild(a);

    a.href = url;
    a.download = "Reporte de ventas.xlsx";
    a.click();
  }

  return { loadingAssists, assists, columns, search, setSearch, filter, setFilter, downloadExcel }
}

export default useAssists;