import { FC, useState, useEffect, useMemo } from 'react';
import { Card, Checkbox, Col, Form, Input, message, Modal, Row, Spin } from 'antd';
import { getFirestore, collection, query, orderBy, DocumentData, Query } from 'firebase/firestore';
import { initExcel } from '../../constants';
import { Excel, UserFirestore } from '../../interfaces';
import useOnSnapshot from '../../hooks/useOnSnapshot';
import { LoadingOutlined } from '@ant-design/icons';

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
  const [form] = Form.useForm();

  useEffect(() => {
    if(loading) return;

    const users = snapshot?.docs.map(doc => ({...doc.data(), id: doc.id})) as UserFirestore[];

    setUsersExcel(users.map(user => ({
      email: user.email,
      name: user.name,
      selected: false,
      userId: user.id as string
    })))
  }, [loading])

  const save = async () => {
    try {
      
    } catch (error) {
      
    }
  }

  const resetForm = () => {
    form.resetFields();
    setExcel(initExcel);
    onClose();
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
                <div style={{minHeight: 200, maxHeight: 200, overflowY: "auto"}}>
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
            </Col>
          </Row>
        </Form>
    }
    </Modal>
  )
}

export default ExcelDialog;