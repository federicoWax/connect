import { Checkbox, Divider, Input, message, Spin, Table, Tag } from 'antd';
import { doc, DocumentData, DocumentReference, getFirestore } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useDocOnSnapshot from '../../../hooks/useDocOnSnapshot';
import { ActiveUser, Excel, RowTableExcel, UserFirestore } from '../../../interfaces';
import { getBlobByUrl, getDocById, update } from '../../../services/firebase';
import { getWorkbookFromFile } from '../../../utils';
import UserTags from './userTags';
import exceljs from "exceljs";
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const SeeExcel = () => {
  const { id } = useParams();
  const { userFirestore } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusChanged, setStatusChanged] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [excel, setExcel] = useState<Excel>();
  const [userIds, setUserIds] = useState<string[]>([]);
  const [tableExcel, setTableExcel] = useState<RowTableExcel[]>([]);

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

  useEffect(() => {
    let mounted = true;

    if (loadingExcel) return;

    const init = async () => {
      try {
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
  }, [docSnapExcel, loadingExcel, loading]);

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
    if(selecting) return;

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


        title: 'Compañia',
        key: 'e',
        dataIndex: 'e',
        render: (_: any, record: RowTableExcel) => (
          <Input
            name={'record' + record.index}
            onBlur={(e) => {
              console.log(e.target.value)
            }}
          />
        )
      },
      {
        title: 'Compañia',
        key: 'f',
        dataIndex: 'f',
        render: (text: string) => text
      },
      {
        title: 'Compañia',
        key: 'g',
        dataIndex: 'g',
        render: (text: string) => text
      },
      {
        title: 'Compañia',
        key: 'h',
        dataIndex: 'h',
        render: (text: string) => text
      },
      {
        title: 'Compañia',
        key: 'i',
        dataIndex: 'i',
        render: (text: string) => text
      },
    ];
  }, [excel, userFirestore, selecting, onSelectRow])

  return (
    <div>
      <h1>Excel: {excel?.name}</h1>
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