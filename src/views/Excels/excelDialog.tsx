import { FC, useState, useEffect, useMemo } from 'react';
import { Button, Card, Checkbox, Col, Form, Input, message, Modal, Row, Spin, Upload } from 'antd';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import { initExcel } from '../../constants';
import { Excel, UserFirestore } from '../../interfaces';
import useOnSnapshot from '../../hooks/useOnSnapshot';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { add, deleteFile, update, uploadFile } from '../../services/firebase';

interface Props {
  open: boolean;
  propExcel: Excel | null;
  onClose: () => void
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
  const [urlToDelete, setUrlToDelete] = useState("");
  const [form] = Form.useForm();

  const fileList = useMemo(() => {
    return excel.file ? [excel.file as RcFile] : []
  }, [excel.file])

  useEffect(() => {
    if(loading) return;

    const users = snapshot?.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[];

    setUsersExcel(users.map(user => ({
      email: user.email,
      name: user.name,
      selected: false,
      userId: user.id as string
    })))
  }, [loading, snapshot])

  const save = async () => {
    if(!excel.file) {
      message.error("Favor de subir un excel.", 4);
      return;
    }

    if(saving) return;
    
    try {
      setSaving(true);

      if(excel.file && typeof excel.file !== "string") {
        const url = await uploadFile("exceles", excel.file);

        if(!url) {
          message.error("Error al subir el archivo excel!");
          return;
        }

        excel.file = url;
      }

      excel.userIds = usersExcel.filter(ue => ue.selected).map(ue => ue.userId);

      if(excel.id) {
        const id = excel.id;

        delete excel.id;

        await update("exceles", id, excel);
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
    form.resetFields();
    setExcel(initExcel);
    setSearchUser("");
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