import { FC, useEffect, useState } from "react";
import { AutoComplete, Col, DatePicker, Form, Input, message, Modal, Row, Select } from "antd";
import { collection, getDocs, getFirestore, query, Timestamp, where } from "firebase/firestore";
import moment from "moment";
import { Autocomplete, Campaign, Client, Cobrador, Sale, UserFirestore } from "../../interfaces";
import { useAuth } from "../../context/AuthContext";
import { add, update } from "../../services/firebase";

const db = getFirestore();
const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  propSale: Sale | null;
  cobradores: Cobrador[];
  clients: Client[];
  users: UserFirestore[];
  campaigns: Campaign[];
  onSearchClients: (value: string) => void;
};

const init_sale: Sale = {
  userId: "",
  client: "",
  dateBirth: null,
  address: "",
  statusLight: "",
  concluded: false,
  paymentMethod: "",
  sends: "",
  receives: "",
  livingPlace: "",
  previousCompany: "",
  notes: "",
  paymentAmount: "",
  email: "",
  campaign: "dVfLotqwqWwSu6u1zowQ",
};

const HomeDialog: FC<Props> = ({open, onClose, propSale, cobradores, clients, users, campaigns, onSearchClients}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchESID, setSearchESID] = useState<string>("");
  const [sale, setSale] = useState<Sale>(init_sale);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [form] = Form.useForm();
  const { user, userFirestore } = useAuth();

  const setForm = (_sale: Sale) => {
    setSale(_sale);
    form.resetFields();
    form.setFieldsValue(_sale);
  }
  
  useEffect(() => {
    setLoading(true);
  }, [open]);

  useEffect(() => {
    if(!loading) return;

    if(propSale) {
      if(propSale.esid) {
        setSearchESID(propSale.esid);
      }

      setPaymentAmount(propSale.paymentAmount);
      setForm(propSale);
    } else {
      setForm(init_sale);
    } 

    setLoading(false);
  }, [form, propSale, cobradores, loading]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    let _sale = {...sale};
    const id = _sale.id;

    if(!id) {
      _sale.team = userFirestore?.team;
      _sale.userId = user?.uid;
      _sale.date = Timestamp.now();

      if(_sale.paymentAmount) {
        _sale.datePayment = Timestamp.now();
      }
    }
    
    if(id && paymentAmount !== _sale.paymentAmount) {
      _sale.datePayment = Timestamp.now();
    }

    delete _sale.id;

    if(!_sale.esid && searchESID && _sale.esid !== searchESID) {
      _sale.esid = searchESID;
    }

    try {
      const clientDocs = await getDocs(query(collection(db, "clients"), where("esid", "==", _sale.esid)));

      if(clientDocs.empty) {
        let client: Client = {
          esid: _sale.esid,
          phone: _sale.phone,
          address: _sale.address,
          email: _sale.email,
          client: _sale.client,
          dateBirth: _sale.dateBirth,
          additionalEmail: _sale.additionalEmail,
          additionalPhone: _sale.additionalPhone,
          statusLight: _sale.statusLight,
          livingPlace: _sale.livingPlace,
          previousCompany: _sale.previousCompany,
          notes: _sale.notes,
          campaign: _sale.campaign
        };

        for(const key in client) {
          const keyClinet = key as keyof Client;

          if(client[keyClinet] === undefined) {
            delete client[keyClinet];
          }
        }

        await add("clients", client);
      }

      id ? await update("sales", id, _sale) : await add('sales', _sale);

      message.success("Venta guardada con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      onClose();
    }
  }

  const optionsClients = clients.map((c) => ({value: c.esid?.toString(), label: c.esid + " - " + c.client})) as Autocomplete[];
  const optionsProcessUser = users.filter(u => u.role !== "Vendedor").map((u) => ({value: u.email, label: u.email + " - " + u.name})) as Autocomplete[];
  
  return (
    <Modal
      width={1000}
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      visible={open}
      onCancel={onClose}
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
          <Col xs={24} sm={24} md={8}>
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
          <Col xs={24} sm={24} md={8}>
            <div>Fecha de nacimiento</div>
            <DatePicker
              clearIcon={null}
              value={moment(sale.dateBirth === null ? undefined : sale.dateBirth?.toDate())}
              onChange={(date) => setSale({...sale, dateBirth: date ? Timestamp.fromDate(date.toDate()) : null }) }
              style={{width: "100%", marginTop: 8}}
              placeholder="Fecha de nacimiento"
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Tel??fono"
              name="phone"
              rules={[{ required: true, message: 'Tel??fono de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={sale.phone} 
                onChange={(e) => setSale({...sale, phone: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Tel??fono adicional"
              name="additionalPhone"
              rules={[{ required: true, message: 'Tel??fono adicional de 10 digitos requerido.', len: 10 }]}
            >
              <Input 
                type="number"
                value={sale.additionalPhone} 
                onChange={(e) => setSale({...sale, additionalPhone: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="ESID"
              name="esid"
              rules={[{ required: true, message: 'ESID requerido.' }]}
            >
              <AutoComplete
                onSearch={setSearchESID}
                value={sale.esid}
                options={optionsClients} 
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={(value: string) => {  
                  if(value) {
                    let clinet = clients.find(c => c.esid === value);
                    
                    delete clinet?.id;
                    delete clinet?.receives;
                    delete clinet?.sends;
                    delete clinet?.paymentMethod;

                    const _sale = {...sale, ...clinet} as Sale;
                    
                    setForm(_sale);
                  }
                }}
                onClear={() => setSale({...sale, esid: ""})}
              >
                <Input.Search 
                  size="middle" 
                  placeholder="Buscar ESID" 
                  enterButton
                  onSearch={() => onSearchClients(searchESID)} 
                />
              </AutoComplete>
            </Form.Item>
            { sale.esid && <div style={{marginBottom: -10}}>{ clients.find(c => c.esid === sale.esid)?.client }</div> }
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Dirreci??n"
              name="address"
              rules={[{ required: true, message: 'Direcci??n requerida.' }]}
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
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Correo electr??nico"
              name="email"
              rules={[{ message: 'Correo electrinico v??lido requerido.', type: 'email' }]}  
            >
              <Input 
                type="email"
                value={sale.email} 
                onChange={(e) => setSale({...sale, email: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Correo electr??nico adicional"
              name="additionalEmail"
              rules={[{ required: true, message: 'Correo electrinico adicional v??lido requerido.', type: 'email' }]}
            >
              <Input 
                type="email"
                value={sale.additionalEmail} 
                onChange={(e) => setSale({...sale, additionalEmail: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Estatus de venta"
              name="statusSale"
            >
              <Select value={sale.statusSale} onChange={value => setSale({...sale, statusSale: value })}>
                <Option value="Activaci??n">Activaci??n</Option>
                <Option value="Mensualidad">Mensualidad</Option>
                <Option value="Desconexi??n">Desconexi??n</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Estatus de servicio"
              name="statusLight"
            >
              <Select value={sale.statusLight} onChange={value => setSale({...sale, statusLight: value })}>
                <Option value="Con luz">Con luz</Option>
                <Option value="Sin luz">Sin luz</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="M??todo de pago"
              name="paymentMethod"
            >
              <Select value={sale.paymentMethod} onChange={value => setSale({...sale, paymentMethod: value })}>
                <Option value="BARRI">BARRI</Option>
                <Option value="Western union">Western union</Option>
                <Option value="Ria">Ria</Option>
                <Option value="Dolex">Dolex</Option>
                <Option value="Zelle">Zelle</Option>x
                <Option value="Cashapp">Cashapp</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="N??mero de referencia"
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
          <Col xs={24} sm={24} md={8}>
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
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Recibe"
              name="receives"
            >
              <Select
                onChange={(value) => setSale({...sale, receives: value})}
                value={sale.receives} 
              >
                <Option key="" value="">Sin receptor</Option>
                {
                  cobradores.map(cobrador => (
                    <Option key={cobrador.id} value={cobrador.name}>{cobrador.name}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
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
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Compa??ia anterior"
              name="previousCompany"
            >
              <Input 
                type="text"
                value={sale.previousCompany} 
                onChange={(e) => setSale({...sale, previousCompany: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Cantidad de cobro"
              name="paymentAmount"
              rules={sale.statusSale === "Mensualidad" ? [{ required: true, message: 'Cantidad de cobro requerida.' }] : []}
            >
              <Input 
                type="number"
                value={sale.paymentAmount} 
                onChange={(e) => setSale({...sale, paymentAmount: e.target.value})}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Usuario de proceso"
              name="processUser"
            >
              <AutoComplete
                allowClear
                value={sale?.processUser}
                options={optionsProcessUser} 
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onChange={async (value: string) => {  
                  setSale({...sale, processUser: value});

                  if(sale.id) {
                    await update("sales", sale.id, { processUser: value });
                  }
                }}
                placeholder="Buscar usuario proceso"
                onClear={() => setSale({...sale, processUser: ""})}
              />              
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{marginTop: 10}}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Campa??a"
              name="campaign"
            >
              <Select
                onChange={(value) => setSale({...sale, campaign: value})}
                value={sale.campaign} 
              >
              {
                campaigns.map(campaign => (
                  <Option key={campaign.id} value={campaign.id}>{campaign.name}</Option>
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