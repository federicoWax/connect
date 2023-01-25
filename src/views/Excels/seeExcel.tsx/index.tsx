import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Divider, message, Spin, Table, Tag } from 'antd';
import { doc, DocumentData, DocumentReference, getFirestore } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useDocOnSnapshot from '../../../hooks/useDocOnSnapshot';
import { ActiveUser, Excel, RowTableExcel, UserFirestore } from '../../../interfaces';
import { add, getBlobByUrl, getDocById, update } from '../../../services/firebase';
import { getWorkbookFromFile } from '../../../utils';
import UserTags from './userTags';
import exceljs from "exceljs";
import { LoadingOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { columnsExcel, columnsTableExcel } from '../../../constants';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const SeeExcel = () => {
  const { id } = useParams();
  const { userFirestore } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusChanged, setStatusChanged] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [excel, setExcel] = useState<Excel>();
  const [userIds, setUserIds] = useState<string[]>([]);
  const [tableExcel, setTableExcel] = useState<RowTableExcel[]>([]);
  const [downloading, setDownloading] = useState(false);
  const inputRefsE = useRef<Array<HTMLInputElement | null>>([]);
  const inputRefsF = useRef<Array<HTMLInputElement | null>>([]);
  const inputRefsG = useRef<Array<HTMLInputElement | null>>([]);
  const inputRefsH = useRef<Array<HTMLInputElement | null>>([]);
  const inputRefsI = useRef<Array<HTMLInputElement | null>>([]);

  const queryExcel = useMemo<DocumentReference<DocumentData> | null>(() => {
    if (!id) return null;

    return doc(getFirestore(), "exceles", id);
  }, [id]);
  const [docSnapExcel, loadingExcel] = useDocOnSnapshot(queryExcel);
  const [sheet, setSheet] = useState<exceljs.Worksheet>()

  const getTableExcel = (sheet: exceljs.Worksheet, _excel: Excel, users: UserFirestore[]) => {
    const _tableExcel: RowTableExcel[] = [];
    const { campaniaE, campaniaF, campaniaG, campaniaH, campaniaI, userRows } = _excel;

    sheet.eachRow((row, numberRow) => {
      if (numberRow !== 1) {
        const indexCampaign = numberRow - 2;
        const rowTableExcel: RowTableExcel = {
          index: indexCampaign,
          userName: users.find(u => u.id === userRows[indexCampaign])?.name || "",
          userId: userRows[indexCampaign],
          firstName: row.getCell(1).value?.toString() as string,
          lastName: row.getCell(2).value?.toString() as string,
          snn: row.getCell(3).value?.toString() as string,
          dob: row.getCell(4).value?.toString() as string,
          e: campaniaE[indexCampaign],
          f: campaniaF[indexCampaign],
          g: campaniaG[indexCampaign],
          h: campaniaH[indexCampaign],
          i: campaniaI[indexCampaign],
          selecting: false
        };

        _tableExcel.push(rowTableExcel);
      }
    });

    return _tableExcel;
  }

  const setInputRefs = (campania: string[], refs: (HTMLInputElement | null)[]) => {
    campania.forEach((value, index) => {
      if (refs[index]) {
        const inputRef = refs[index] as HTMLInputElement;
        inputRef.value = value;
      }
    })
  }

  useEffect(() => {
    let mounted = true;

    if (loadingExcel) return;

    const init = async () => {
      try {
        if (!docSnapExcel?.exists()) {
          navigate("/exceles");
          return;
        }

        const _excel = { ...docSnapExcel?.data(), id: docSnapExcel?.id } as Excel;
        const _userIds = _excel.userIds;
        const docPromises = _userIds.map(userId => getDocById("users", userId));

        const allDocs = await Promise.all(docPromises);

        const users = allDocs.map(doc => ({ ...doc.data(), id: doc.id })) as UserFirestore[];

        setExcel({
          ..._excel,
          activeUsers: _excel.activeUsers.map(au => ({
            ...au,
            user: users.find(u => u.id === au.userId)
          }))
        });

        const { campaniaE, campaniaF, campaniaG, campaniaH, campaniaI } = _excel;
        const refsE = inputRefsE.current;
        const refsF = inputRefsF.current;
        const refsG = inputRefsG.current;
        const refsH = inputRefsH.current;
        const refsI = inputRefsI.current;

        setInputRefs(campaniaE, refsE);
        setInputRefs(campaniaF, refsF);
        setInputRefs(campaniaG, refsG);
        setInputRefs(campaniaH, refsH);
        setInputRefs(campaniaI, refsI);

        if (JSON.stringify(_userIds) !== JSON.stringify(userIds)) {
          setUserIds(_userIds);

          const blobExcel = await getBlobByUrl(_excel?.file as string) as Blob;

          const fileExcel = new File([blobExcel], "excel.xlsx", { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          const workbook = await getWorkbookFromFile(fileExcel) as exceljs.Workbook;

          const _sheet = workbook.worksheets[0];
          const _tableExcel = getTableExcel(_sheet, _excel, users);

          setSheet(_sheet);
          setTableExcel(_tableExcel);
          return;
        }

        const _tableExcel = getTableExcel(sheet as exceljs.Worksheet, _excel, users);

        if (!mounted) return;

        setTableExcel(_tableExcel);
      } catch (error) {
        console.log(error);
        message.error("Error al cargar el excel!");
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    }
  }, [docSnapExcel, loadingExcel, loading, navigate]);

  const changeStatus = useCallback(async () => {
    if (!id || !userFirestore) return;

    try {
      const docExcel = await getDocById("exceles", id);
      const activeUsers = docExcel.data()?.activeUsers as ActiveUser[];

      await update(
        "exceles",
        id,
        {
          activeUsers: activeUsers.map(au => au.userId === userFirestore.id ? ({ ...au, active: true, lastUpdate: new Date() }) : au)
        }
      );
    } catch (error) {
      message.error("Ocurrio un error al cambiar el estatus", 4);
      console.log(error);
    } finally {
      setStatusChanged(true);
    }
  }, [id, userFirestore])

  const onSelectRow = useCallback(async (record: RowTableExcel) => {
    if (selecting) return;

    setSelecting(true);
    setTableExcel(t => t.map(row => row.index === record.index ? ({ ...row, selecting: true }) : row));

    try {
      await update(
        "exceles",
        excel?.id as string,
        { userRows: excel?.userRows.map((row, i) => i === record.index ? (record.userId ? "" : userFirestore?.id) : row) }
      );
    } catch (error) {
      console.log(error);
      message.error("Ocurro un error al cambiar el estado de la selección!", 4)
    } finally {
      setTimeout(() => {
        setSelecting(false);
      }, 1000)
    }
  }, [selecting, excel, userFirestore])

  const saveCampaign = useCallback(async (record: RowTableExcel, value: string, key: string) => {
    if (!excel) return;

    let compania = excel[key as keyof Excel] as string[]

    compania = compania.map((e, i) => i === record.index ? value : e);

    try {
      await update("exceles", excel?.id as string, { [key]: compania });
      await add(
        "historyExcels",
        {
          excelId: excel.id,
          userId: userFirestore?.id,
          createdAt: new Date(),
          column: key,
          row: record.index,
          value
        }
      );

    } catch (error) {
      console.log(error);
      message.error("Error al guardar la celda.", 4);
    }
  }, [excel, userFirestore?.id])

  useEffect(() => {
    if (statusChanged) return;

    changeStatus();
  }, [changeStatus, statusChanged])

  useEffect(() => {
    const interval = setInterval(() => {
      changeStatus().then(() => { });
    }, 1200000);

    return () => clearInterval(interval);
  }, [changeStatus])

  const columns = useMemo(() => {
    return [
      {
        width: 70,
        title: 'Selecionar',
        key: 'select',
        render: (_: any, record: RowTableExcel) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {
              record.selecting
                ? <Spin indicator={antIcon} />
                : <Checkbox
                  checked={record.userId !== "" && excel?.userRows.includes(record.userId)}
                  onChange={async () => await onSelectRow(record)}
                  disabled={selecting || (record.userId !== "" && excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
                />
            }
          </div>
        )
      },
      {
        width: 150,
        title: 'Usuario',
        key: 'userName',
        dataIndex: 'userName',
        render: (_: any, record: RowTableExcel) => {
          const color = excel?.activeUsers.find(au => au.userId === record.userId)?.color || "";

          return (
            <Tag
              style={{ margin: 3 }}
              color={color}
            >
              <b>{record.userName.toUpperCase()}</b>
            </Tag>
          )
        }
      },
      {
        width: 150,
        title: 'First Name',
        key: 'firstName',
        dataIndex: 'firstName',
        render: (text: string) => text,
      },
      {
        width: 150,
        title: 'Last Name',
        key: 'lastName',
        dataIndex: 'lastName',
        render: (text: string) => text,
      },
      {
        width: 130,
        title: 'SNN',
        key: 'snn',
        dataIndex: 'snn',
        render: (text: string) => text,
      },
      {
        width: 100,
        title: 'DOB',
        key: 'dob',
        dataIndex: 'dob',
        render: (text: string) => text,
      },
      {
        width: 150,
        title: 'Compañia',
        key: 'e',
        dataIndex: 'e',
        render: (_: any, record: RowTableExcel) => (
          <input
            ref={e => inputRefsE.current[record.index] = e}
            disabled={inputRefsF.current[record.index] === null || record.userId === "" || (excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
            name={'companiae' + record.index}
            onBlur={async (e) => await saveCampaign(record, e.target.value, "campaniaE")}
          />
        )
      },
      {
        width: 150,
        title: 'Compañia',
        key: 'f',
        dataIndex: 'f',
        render: (_: any, record: RowTableExcel) => (
          <input
            ref={e => inputRefsF.current[record.index] = e}
            disabled={inputRefsF.current[record.index] === null || record.userId === "" || (excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
            name={'companiaf' + record.index}
            onBlur={async (e) => await saveCampaign(record, e.target.value, "campaniaF")}
          />
        )
      },
      {
        width: 150,
        title: 'Compañia',
        key: 'g',
        dataIndex: 'g',
        render: (_: any, record: RowTableExcel) => (
          <input
            ref={e => inputRefsG.current[record.index] = e}
            disabled={inputRefsF.current[record.index] === null || record.userId === "" || (excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
            name={'companiag' + record.index}
            onBlur={async (e) => await saveCampaign(record, e.target.value, "campaniaG")}
          />
        )
      },
      {
        width: 150,
        title: 'Compañia',
        key: 'h',
        dataIndex: 'h',
        render: (_: any, record: RowTableExcel) => (
          <input
            ref={e => inputRefsH.current[record.index] = e}
            disabled={inputRefsF.current[record.index] === null || record.userId === "" || (excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
            name={'companiah' + record.index}
            onBlur={async (e) => await saveCampaign(record, e.target.value, "campaniaH")}
          />
        )
      },
      {
        width: 150,
        title: 'Compañia',
        key: 'i',
        dataIndex: 'i',
        render: (_: any, record: RowTableExcel) => (
          <input
            ref={e => inputRefsI.current[record.index] = e}
            disabled={inputRefsF.current[record.index] === null || record.userId === "" || (excel?.userRows.includes(record.userId) && record.userId !== userFirestore?.id)}
            name={'companiai' + record.index}
            onBlur={async (e) => await saveCampaign(record, e.target.value, "campaniaI")}
          />
        )
      },
    ];
  }, [excel, userFirestore, selecting, onSelectRow, saveCampaign])

  const downloadExcel = async () => {
    if (downloading) return;

    try {
      setDownloading(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de ventas');

      worksheet.columns = columnsTableExcel;

      columnsExcel.forEach(column => {
        worksheet.getCell(column + '1').font = {
          bold: true
        };
      })

      worksheet.addRows(tableExcel);

      const data = await workbook.xlsx.writeBuffer();
      const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      document.body.appendChild(a);

      a.href = url;
      a.download = `${excel?.name}.xlsx`;
      a.click();
    } catch (error) {
      console.log(error);
      message.error("Ocurrio un error al descargar el excel.", 4);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Excel: {excel?.name}</h1>
        {
          userFirestore?.role === "Administrador" && <Button
            type="primary"
            onClick={downloadExcel}
            loading={downloading || loading}
          >
            Descargar excel
          </Button>
        }
      </div>
      <UserTags activeUsers={excel?.activeUsers as ActiveUser[]} />
      <Divider />
      <Table
        scroll={{
          x: 2000,
        }}
        columns={columns}
        dataSource={tableExcel.map((t, i) => ({ ...t, key: i }))}
        pagination={false}
        loading={loading}
      />
    </div>
  )
}

export default SeeExcel;