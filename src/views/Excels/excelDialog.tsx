import { FC, useState, useEffect, useMemo } from 'react';
import { Button, Card, Checkbox, Col, Form, Input, message, Modal, Row, Spin, Upload } from 'antd';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import { initExcel } from '../../constants';
import { Excel, UserFirestore } from '../../interfaces';
import useOnSnapshot from '../../hooks/useOnSnapshot';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { add, deleteFile, update, uploadFile } from '../../services/firebase';
import exceljs from "exceljs";
import { getWorkbookFromFile } from '../../utils';


interface Props {
  open: boolean;
  propExcel: Excel | null;
  onClose: () => void;
}

interface UserExcel {
  userId: string;
  name: string;
  email: string;
  selected: boolean;
}

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ExcelDialog: FC<Props> = ({open, propExcel, onClose}) => {
  const queryUsers = useMemo<Query<DocumentData>>(() => query(collection(getFirestore(), "users"), orderBy('name')), []);
  const [snapshot, loading] = useOnSnapshot(queryUsers);
  const [excel, setExcel] = useState(initExcel);
  const [saving, setSaving] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [usersExcel, setUsersExcel] = useState<UserExcel[]>([]);
  const [users, setUsers] = useState<UserFirestore[]>([]);
  const [urlToDelete, setUrlToDelete] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if(propExcel) {
      form.setFieldsValue(propExcel);
      setExcel(propExcel);
      return;
    }

    setExcel(initExcel);
  }, [propExcel, form]);

  const fileList = useMemo(() => {
    return excel.file ? [excel.file as RcFile] : []
  }, [excel.file])

  useEffect(() => {
    if(loading) return;

    const _users = snapshot?.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[];

    setUsers(_users);
    setUsersExcel(_users.map(user => ({
      email: user.email,
      name: user.name,
      selected: propExcel ? propExcel.userIds.includes(user.id as string) : false,
      userId: user.id as string
    })));
  }, [loading, snapshot, propExcel])

  const save = async () => {
    if(!excel.file) {
      message.error("Favor de subir un excel.", 4);
      return;
    }

    if(saving) return;
    
    try {
      setSaving(true);
      let file: null | File = null;

      if(excel.file && typeof excel.file !== "string") {
        const url = await uploadFile("exceles", excel.file);

        if(!url) {
          message.error("Error al subir el archivo excel!");
          return;
        }

        const workbook = await getWorkbookFromFile(excel.file) as exceljs.Workbook;
        const sheet = workbook.worksheets[0];
        const totalWorkRows = sheet.rowCount - 1;
        const workColumns = Array.from({length: totalWorkRows}, () => "");

        file = excel.file;
        excel.userRows = workColumns;
        excel.campaniaE = workColumns;
        excel.campaniaF = workColumns;
        excel.campaniaG = workColumns;
        excel.campaniaH = workColumns;
        excel.campaniaI = workColumns;
        excel.file = url;
      }

      excel.userIds = usersExcel.filter(ue => ue.selected).map(ue => ue.userId);
      excel.userColors = excel.userIds.map(userId => {
        const color = Math.floor(Math.random() * 16777215).toString(16);

        return {
          color: `#${color}`,
          userId
        }
      });

      if(excel.id) {
        const id = excel.id;

        delete excel.id;

        let dataUpdate = {
          name: excel.name,
          userIds: excel.userIds,
          userColors: excel.userColors,
        } as any;

        if(file) {
          dataUpdate.userRows = excel.userRows;
          dataUpdate.file = excel.file;
          dataUpdate.campaniaE = excel.campaniaE;
          dataUpdate.campaniaF = excel.campaniaF;
          dataUpdate.campaniaG = excel.campaniaG;
          dataUpdate.campaniaH = excel.campaniaH;
          dataUpdate.campaniaI = excel.campaniaI;
        }
        
        await update("exceles", id, dataUpdate);
      } else {
        await add("exceles", excel);
      }

      if(urlToDelete) {
        await deleteFile(urlToDelete);
      }

      message.success("Excel guardado con exito!");
      resetForm();
    } catch (error) {
      message.error("Error al guardar el excel!");
      console.log(error);
    } finally {
      setSaving(false);
    }
  }

  const resetForm = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setExcel(initExcel);
      setSearchUser("");
      setUsersExcel(users.map(user => ({
        email: user.email,
        name: user.name,
        selected: false,
        userId: user.id as string
      })));
    }, 300);
  }

  return (
    <Modal
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      open={open}
      onCancel={resetForm}
      onOk={() => form.validateFields().then(save)}
      title={excel.id ? "Editar excel" : "Agregar excel"}
      cancelText="Cancelar"
      okText="Guardar"
    >
    {
      loading
      ?
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200
          }}
        >
          <Spin indicator={antIcon}/>
        </div>
      :
        <Form 
          form={form}
          layout="vertical" 
          style={{overflowY: "auto", overflowX: "hidden", maxHeight: 500}}
        >
          <Row gutter={10} style={{marginTop: 10}}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Nombre"
                name="name"
                rules={[{ required: true, message: 'Nombre requerido.' }]}
              >
                <Input
                  value={excel.name} 
                  onChange={(e) => setExcel({...excel, name: e.target.value})}
                />
              </Form.Item>
              <h4>Usuarios asignados al excel</h4>
              <Card>
                <label>Buscar usuario</label>
                <Input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <br />
                <div style={{minHeight: 190, maxHeight: 190, overflowY: "auto"}}>
                {
                  usersExcel
                    .filter(ue => ue.name.toLowerCase().includes(searchUser.toLowerCase()) || ue.email.toLowerCase().includes(searchUser.toLowerCase()) )
                    .map((user) => (
                    <Row key={user.userId} style={{marginTop: 10}}>
                      <Col xs={22}>
                        <div>{user.name}</div>
                        <div style={{fontSize: 10}}>{user.email}</div>
                      </Col>
                      <Col xs={2} >
                        <Checkbox 
                          checked={user.selected} 
                          onChange={() => setUsersExcel(usersExcel.map(u => u.userId === user.userId ? ({...u, selected: !u.selected}) : u))} 
                        /> 
                      </Col>
                    </Row>
                  ))
                }
                </div>
              </Card>
              <br />
              <Upload
                fileList={fileList}
                beforeUpload={(file) => setExcel({...excel, file})}
                onRemove={(file) => {
                  if(file.url?.includes("https://firebasestorage.googleapis.com")) {
                    setUrlToDelete(file.url)
                  }

                  setExcel({...excel, file: undefined});
                }}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                <Button type="primary" icon={<UploadOutlined />}>Excel</Button>
              </Upload>
            </Col>
          </Row>
        </Form>
    }
    </Modal>
  )
}

export default ExcelDialog;