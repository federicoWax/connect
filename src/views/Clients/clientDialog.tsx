import { FC, useEffect, useState } from "react";
import { Col, DatePicker, Form, Input, message, Modal, Row, Select } from "antd";
import { getFirestore, collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import moment from "moment";
import { Client, Cobrador } from "../../interfaces";
import { add, update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propClient: Client | null;
  cobradores: Cobrador []
};

const db = getFirestore();
const { Option } = Select;
const init_sale: Client = {
  client: "",
  dateBirth: null,
  address: "",
  statusLight: "",
  paymentMethod: "",
  sends: "",
  receives: "",
  livingPlace: "",
  previousCompany: "",
  notes: "",
  email: "",
  campaign: "COLOMBIANA",
};

const CliendDialog: FC<Props> = ({open, onClose, propClient, cobradores}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [client, setClient] = useState<Client>(init_sale);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propClient) {
      if(!cobradores.some(c => c.id === propClient.receives)) {
        propClient.receives = "";
      }

      form.setFieldsValue(propClient);
      setClient(propClient);
    }
  }, [form, propClient, cobradores]);

  const save = async () => {
    if(saving) return;

    const other = await getDocs(query(collection(db, "clients"), where("esid", "==", client.esid)));

    if(other.docs.length && other.docs[0].id !== client.id) {
      message.error("Ya existe un cliente registrado con este ESID.");
      return;
    }

    setSaving(true);

    let _client = {...client};
    

    const id = _client.id;

    delete _client.id;

    try {
      id ? await update("clients", id, _client ) : await add('clients', _client);

      message.success("Cliente guardado con exito!");
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
    setClient(init_sale);
    onClose();
  }

  return (
   <Modal
      width={1000}
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
      title={client.id ? "Editar cliente" : "Agregar cliente"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form 
        form={form}
        layout="vertical" 
        style={{overflowY: "auto", overflowX: "hidden", maxHeight: 500}}
      >
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Cliente"
              name="client"
              rules={[{ required: true, message: 'Cliente requerido.' }]}
            >
              <Input
                value={client.client} 
                onChange={(e) => setClient({...client, client: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div>Fecha de nacimiento</div>
            <DatePicker
              clearIcon={null}
              value={moment(client.dateBirth === null ? undefined : client.dateBirth?.toDate())}
              onChange={(date) => setClient({...client, dateBirth: date ? Timestamp.fromDate(date.toDate()) : null }) }
              style={{width: "100%", marginTop: 8}}
              placeholder="Fecha de nacimiento"
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[{ required: true, message: 'Teléfono de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={client.phone} 
                onChange={(e) => setClient({...client, phone: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Teléfono adicional"
              name="additionalPhone"
              rules={[{ required: true, message: 'Teléfono adicional de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={client.additionalPhone} 
                onChange={(e) => setClient({...client, additionalPhone: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="ESID"
              name="esid"
              rules={[{ required: true, message: 'ESID requerido.' }]}
            >
              <Input 
                type="number"
                value={client.esid} 
                onChange={(e) => setClient({...client, esid: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Dirreción"
              name="address"
              rules={[{ required: true, message: 'Dirección requerida.' }]}
            >
              <Input 
                type="text"
                value={client.address} 
                onChange={(e) => setClient({...client, address: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[{ message: 'Correo electrinico válido requerido.', type: 'email' }]}  
            >
              <Input 
                type="email"
                value={client.email} 
                onChange={(e) => setClient({...client, email: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Correo electrónico adicional"
              name="additionalEmail"
              rules={[{ required: true, message: 'Correo electrinico adicional válido requerido.', type: 'email' }]}
            >
              <Input 
                type="email"
                value={client.additionalEmail} 
                onChange={(e) => setClient({...client, additionalEmail: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Compañia anterior"
              name="previousCompany"
            >
              <Input 
                type="text"
                value={client.previousCompany} 
                onChange={(e) => setClient({...client, previousCompany: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Estatus de luz"
              name="statusLight"
            >
              <Select value={client.statusLight} onChange={value => setClient({...client, statusLight: value })}>
                <Option value="Con luz">Con luz</Option>
                <Option value="Sin luz">Sin luz</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Método de pago"
              name="paymentMethod"
            >
              <Select value={client.paymentMethod} onChange={value => setClient({...client, paymentMethod: value })}>
                <Option value="BARRI">BARRI</Option>
                <Option value="Western union">Western union</Option>
                <Option value="Ria">Ria</Option>
                <Option value="Dolex">Dolex</Option>
                <Option value="Zelle">Zelle</Option>
                <Option value="Cashapp">Cashapp</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Vivienda"
              name="livingPlace"
              rules={[{ required: true, message: 'Vivienda requerida.' }]}
            >
              <Select value={client.livingPlace} onChange={value => setClient({...client, livingPlace: value })}>
                <Option value="Casa">Casa</Option>
                <Option value="Traila">Traila</Option>
                <Option value="Apartamento">Apartamento</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Envia"
              name="sends"
            >
              <Input 
                type="text"
                value={client.sends} 
                onChange={(e) => setClient({...client, sends: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Recibe"
              name="receives"
            >
              <Select
                onChange={(value) => setClient({...client, receives: value})}
                value={client.receives} 
              >
                <Option key="" value="">Sin receptor</Option>
                {
                  cobradores.map(cobrador => (
                    <Option key={cobrador.id} value={cobrador.id}>{cobrador.name}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Notas"
              name="notes"
            >
              <Input.TextArea
                value={client.notes} 
                onChange={(e) => setClient({...client, notes: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default CliendDialog;