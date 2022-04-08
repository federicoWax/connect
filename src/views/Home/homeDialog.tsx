import { FC, useEffect, useState } from "react";
import { Col, DatePicker, Form, Input, message, Modal, Row, Select } from "antd";
import { Timestamp } from "firebase/firestore";
import moment from "moment";
import { Cobrador, Sale } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { add, update } from "../../services/firebase";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  propSale: Sale | null;
  cobradores: Cobrador[];
};

const init_sale: Sale = {
  userId: "",
  client: "",
  dateBirth: null,
  address: "",
  statusSale: "",
  statusLight: "",
  date: null,
  concluded: false,
  paymentMethod: "",
  sends: "",
  receives: "",
  livingPlace: "",
  previousCompany: "",
  notes: ""
};

const HomeDialog: FC<Props> = ({open, onClose, propSale, cobradores}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [sale, setSale] = useState<Sale>(init_sale);
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    if(propSale) {
      if(!cobradores.some(c => c.id === propSale.receives)) {
        propSale.receives = "";
      }
      
      form.setFieldsValue(propSale);
      setSale(propSale);
    }
  }, [form, propSale, cobradores]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    let _sale = {...sale};
    _sale.date = Timestamp.now();
    _sale.userId = user?.uid;

    const id = _sale.id;

    delete _sale.id;

    try {
      id ? await update("sales", id, _sale ) : await add('sales', _sale);

      message.success("Venta guardada con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      resetForm();
    }
  }

  const resetForm = () => {
    form.resetFields();
    setSale(init_sale);
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
            <DatePicker
              clearIcon={null}
              value={moment(sale.dateBirth === null ? undefined : sale.dateBirth?.toDate())}
              onChange={(date) => setSale({...sale, dateBirth: date ? Timestamp.fromDate(date.toDate()) : null }) }
              style={{width: "100%", marginTop: 30}}
              placeholder="Fecha de nacimiento"
            />
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
                onChange={(e) => setSale({...sale, esid: e.target.value})}
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
                value={sale.address} 
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
            >
              <Input 
                type="text"
                value={sale.referenceNumber} 
                onChange={(e) => setSale({...sale, referenceNumber: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Envia"
              name="sends"
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
            >
              <Select
                onChange={(value) => setSale({...sale, receives: value})}
                value={sale.receives} 
              >
                {
                  cobradores.map(cobrador => (
                    <Option key={cobrador.id} value={cobrador.id}>{cobrador.name}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Vivienda"
              name="livingPlace"
              rules={[{ required: true, message: 'Vivienda requerida.' }]}
            >
              <Select value={sale.livingPlace} onChange={value => setSale({...sale, livingPlace: value })}>
                <Option value="Casa">Casa</Option>
                <Option value="Traila">Traila</Option>
                <Option value="Apartamento">Apartamento</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="Compañia anterior"
              name="previousCompany"
            >
              <Input 
                type="text"
                value={sale.previousCompany} 
                onChange={(e) => setSale({...sale, previousCompany: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Notas"
              name="notes"
            >
              <Input.TextArea
                value={sale.notes} 
                onChange={(e) => setSale({...sale, notes: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default HomeDialog;