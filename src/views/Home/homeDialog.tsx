import { FC, useEffect, useState } from "react";
import { Col, DatePicker, Form, Input, Modal, Row, Select, Switch } from "antd";
import { Sale } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import moment from "moment";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  propSale: Sale | null;
};

const init_sale: Sale = {
  userId: "",
  client: "",
  dateBirth: null,
  address: "",
  statusSale: "Activación",
  statusLight: "Con luz",
  date: null,
  concluded: false,
  paymentMethod: "",
  sends: "",
  receives: "",
};

const HomeDialog: FC<Props> = ({open, onClose, propSale}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale>(init_sale);
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    if(user) {
      const _sale = {
        ...sale,
        userId: user.uid,
      };

      setSale(_sale);

      form.setFieldsValue(_sale);
    }
  }, [user]);


  const save = () => {
    let _sale = {...sale};
    _sale.date = Timestamp.now();

    console.log(_sale);
  }

  const resetForm = () => {
    const _sale: Sale = {
      ...init_sale,
      userId: user?.uid,
    };

    form.setFieldsValue(_sale);
    setSale(_sale);
    onClose();
  }

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
      title={sale.id ? "Editar venta" : "Agregar venta"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form 
        form={form}
        layout="vertical" 
        style={{overflowY: "auto", overflowX: "hidden", maxHeight: 500}}
      >
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Cliente"
              name="client"
              rules={[{ required: true, message: 'Cliente requerido.' }]}
            >
              <Input
                value={sale.client} 
                onChange={(e) => setSale({...sale, client: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Fecha de nacimiento"
              name="dateBirth"
              rules={[{ required: true, message: 'Fecha de nacimiento requerida.' }]}
            >
              <DatePicker
                value={sale.dateBirth === null ? sale.dateBirth : moment(sale.dateBirth?.toDate())}
                onChange={(date) => setSale({...sale, dateBirth: date ? Timestamp.fromDate(date.toDate()) : null }) }
                style={{width: "100%"}}
                placeholder="Fecha de nacimiento"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[{ required: true, message: 'Teléfono de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={sale.phone} 
                onChange={(e) => setSale({...sale, phone: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Teléfono adicional"
              name="additionalPhone"
              rules={[{ required: true, message: 'Teléfono adicional de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={sale.additionalPhone} 
                onChange={(e) => setSale({...sale, additionalPhone: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="ESID"
              name="esid"
              rules={[{ required: true, message: 'ESID requerido.' }]}
            >
              <Input 
                type="number"
                value={sale.esid} 
                onChange={(e) => setSale({...sale, esid: Number(e.target.value)})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Dirreción"
              name="address"
              rules={[{ required: true, message: 'Dirección requerida.' }]}
            >
              <Input 
                type="text"
                value={sale.esid} 
                onChange={(e) => setSale({...sale, address: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[{ message: 'Correo electrinico válido requerido.', type: 'email' }]}  
            >
              <Input 
                type="email"
                value={sale.email} 
                onChange={(e) => setSale({...sale, email: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Correo electrónico adicional"
              name="additionalEmail"
              rules={[{ required: true, message: 'Correo electrinico adicional válido requerido.', type: 'email' }]}
            >
              <Input 
                type="email"
                value={sale.additionalEmail} 
                onChange={(e) => setSale({...sale, additionalEmail: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Estatus de venta"
              name="statusSale"
            >
              <Select value={sale.statusSale} onChange={value => setSale({...sale, statusSale: value })}>
                <Option value="Activación">Activación</Option>
                <Option value="Mensualidad">Mensualidad</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Estatus de luz"
              name="statusLight"
            >
              <Select value={sale.statusLight} onChange={value => setSale({...sale, statusLight: value })}>
                <Option value="Con luz">Con luz</Option>
                <Option value="Sin luz">Sin luz</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Método de pago"
              name="paymentMethod"
              rules={[{ required: true, message: 'Método de pago requerido.' }]}
            >
              <Select value={sale.paymentMethod} onChange={value => setSale({...sale, paymentMethod: value })}>
                <Option value="BARRI">BARRI</Option>
                <Option value="Western union">Western union</Option>
                <Option value="Ria">Ria</Option>
                <Option value="Dolex">Dolex</Option>
                <Option value="Zelle">Zelle</Option>
                <Option value="Cashapp">Cashapp</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Número de referencia"
              name="referenceNumber"
              rules={[{ required: true, message: 'Número de referencia requerido.' }]}
            >
              <Input 
                type="number"
                value={sale.referenceNumber} 
                onChange={(e) => setSale({...sale, referenceNumber: Number(e.target.value)})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Envia"
              name="sends"
              rules={[{ required: true, message: 'Envia requerido.' }]}
            >
              <Input 
                type="text"
                value={sale.sends} 
                onChange={(e) => setSale({...sale, sends: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Recibe"
              name="receives"
              rules={[{ required: true, message: 'Recibe requerida.' }]}
            >
              <Input 
                type="text"
                value={sale.receives} 
                onChange={(e) => setSale({...sale, receives: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <label style={{marginRight: 10}}>Venta concluida</label>
            <Switch title="Venta concluida" checked={sale.concluded} onChange={checked => setSale({...sale, concluded: checked})} />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default HomeDialog;