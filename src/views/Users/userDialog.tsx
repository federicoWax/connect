import { FC, useEffect, useState } from 'react';
import { Modal, Row, Col, Form, Input, Select, message } from 'antd';
import { Team, UserFirestore } from '../../interfaces';
import { post } from '../../services/http';
import { getFirestore, collection, getDocs, query, where, DocumentData, Query } from 'firebase/firestore';

interface Props {
  open: boolean;
  onClose: () => void;
  propUser: UserFirestore | null;
  teams: Team[];
};

const db = getFirestore();
const { Option } = Select;
const init_user: UserFirestore = {
  id: '',
  email: '',
  role: '',
  name: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  city: '',
  team: '',
};

const UserDialog: FC<Props> = ({open, onClose, propUser, teams}) => {
  const [user, setUser] = useState<UserFirestore>(init_user);
  const [saving, setSaving] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propUser) {
      form.setFieldsValue(propUser);
      setUser(propUser);
    }
  }, [propUser, form]);

  const save = async () => {
    if(saving) return;

    if(user.password && (user.password !== user.passwordConfirm)) {

      message.error("Las contraseñas no coinciden");
      return;
    }

    let _user = {...user};
    _user.email = _user.email.toLowerCase();

    const otherUser = await getDocs(query(collection(db, "users"), where("email", "==", _user.email)));

    if(otherUser.docs.length && otherUser.docs[0].id !== _user.id) {
      message.error("El correo ya está registrado");
      return;
    }

    setSaving(true);

    delete _user.passwordConfirm;

    try {
      await post(_user.id ? 'users/update' : 'users/create', _user);
      message.success("Usuario guardado con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      resetForm();
    }
  };

  const resetForm = () => {
    form.resetFields();
    setUser(init_user);
    onClose();
  }

  const passwordRequired = Boolean(!user.id || (user.id && user.password));

  return (
    <Modal
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      visible={open}
      onCancel={resetForm}
      onOk={() => {
        form.validateFields()
          .then(save)
          .catch(() => {});
      }}
      title={user.id ? "Editar Usuario" : "Agregar Usuario"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form 
        form={form}
        layout="vertical" 
        style={{overflowY: "auto", overflowX: "hidden", maxHeight: 500}}
      >
        <Row gutter={10}>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: 'Nombre requerido.' }]}
            >
              <Input
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
              />
            </Form.Item>
            <Form.Item
              label="Correo"
              name="email"
              rules={[{ required: true, message: 'Favor de escribir un Correo válido.', type: 'email' }]}
            >
              <Input 
                type="email"
                value={user.email} 
                onChange={(e) => setUser({...user, email: e.target.value})}
              />
            </Form.Item>
            <Row gutter={10} style={{marginTop: 10}}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Contraseña"
                  name="password"
                  rules={[{ required: passwordRequired, message: 'Contraseña de 6 digitos requerida.', min: passwordRequired? 0 : 6 }]}
                >
                  <Input 
                    type="password"
                    value={user.password} 
                    onChange={(e) => setUser({...user, password: e.target.value})}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Contraseña de confirmación"
                  name="passwordConfirm"
                  rules={[{ required: passwordRequired, message: 'Contraseña de confirmación de 6 digitos requerida.', min: passwordRequired ? 0 : 6 }]}
                >
                  <Input 
                    type="password"
                    value={user.passwordConfirm} 
                    onChange={(e) => setUser({...user, passwordConfirm: e.target.value})}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={10} style={{marginTop: 10}}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Rol"
                  name="role"
                  rules={[{ required: true, message: 'Rol requerido.' }]}
                >
                  <Select value={user.role} onChange={value => setUser({...user, role: value})}>
                    <Option value="Vendedor">Vendedor</Option>
                    <Option value="Procesos">Procesos</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Teléfono"
                  name="phone"
                  rules={[{ required: true, message: 'Teléfono de 10 digitos requerido.', len: 10 }]}
                >
                  <Input 
                    type="number"
                    value={user.phone} 
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={10} style={{marginTop: 10}}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Equipo"
                  name="team"
                  rules={[{ required: true, message: 'Equipo requerido.' }]}
                >
                  <Select value={user.team} onChange={value => setUser({...user, team: value})}>
                  {
                    teams.map(t => (
                      <Option key={t.id} value={t.name}>{t.name}</Option>
                    ))
                  }
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Ciudad"
                  name="city"
                  rules={[{ required: true, message: 'Ciudad requerida.' }]}
                >
                  <Input
                    value={user.city} 
                    onChange={(e) => setUser({...user, city: e.target.value})}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UserDialog;