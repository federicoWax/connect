import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { AutoComplete, Col, DatePicker, Form, Input, message, Modal, Row, Select } from "antd";
import { collection, getDocs, getFirestore, query, Timestamp, where } from "firebase/firestore";
import dayjs from "dayjs";
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

const HomeDialog: FC<Props> = ({ open, onClose, propSale, cobradores, clients, users, campaigns, onSearchClients }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchESID, setSearchESID] = useState<string>("");
  const [sale, setSale] = useState<Sale>(init_sale);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [form] = Form.useForm();
  const { user, userFirestore } = useAuth();

  const setForm = useCallback((_sale: Sale) => {
    setSale(_sale);
    form.resetFields();
    form.setFieldsValue(_sale);
  }, [form])

  useEffect(() => {
    setLoading(true);
  }, [open]);

  useEffect(() => {
    if (!loading) return;

    if (propSale) {
      if (propSale.esid) {
        setSearchESID(propSale.esid);
      }

      setPaymentAmount(propSale.paymentAmount);
      setForm(propSale);
    } else {
      setForm(init_sale);
    }

    setLoading(false);
  }, [propSale, cobradores, loading, setForm]);

  const disabledInputs = useMemo(() => {
    return sale.id !== undefined && sale.userId !== user?.uid && userFirestore?.role !== "Administrador";
  }, [userFirestore, sale, user])

  const optionsSellers = useMemo(() => users.map((u) => ({ value: u.email, label:  u.name + " - " + u.email })) as Autocomplete[], [users]);

  const save = async () => {
    if (saving) return;

    setSaving(true);

    let _sale = { ...sale };
    const id = _sale.id;

    if (!id) {
      _sale.team = userFirestore?.team;
      _sale.userId = user?.uid;
      _sale.date = Timestamp.now();

      if (_sale.paymentAmount) {
        _sale.datePayment = Timestamp.now();
      }
    }

    if (id && paymentAmount !== _sale.paymentAmount) {
      _sale.datePayment = Timestamp.now();
    }

    delete _sale.id;

    if (!_sale.esid && searchESID && _sale.esid !== searchESID) {
      _sale.esid = searchESID;
    }

    try {
      const clientDocs = await getDocs(query(collection(db, "clients"), where("esid", "==", _sale.esid)));

      if (clientDocs.empty) {
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

        for (const key in client) {
          const keyClinet = key as keyof Client;

          if (client[keyClinet] === undefined) {
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

  const optionsClients = clients.map((c) => ({ value: c.esid?.toString(), label: c.esid + " - " + c.client })) as Autocomplete[];
  const optionsProcessUser = users.filter(u => u.role !== "Vendedor").map((u) => ({ value: u.email, label: u.email + " - " + u.name })) as Autocomplete[];
  const hideInputs = userFirestore?.role === "Procesos" && sale.id && sale.userId !== user?.uid;

  return (
    <Modal
      width={1000}
      forceRender
      destroyOnClose={true}
      confirmLoading={saving}
      open={open}
      onCancel={onClose}
      onOk={() => {
        form.validateFields()
          .then(save)
          .catch(() => { });
      }}
      title={sale.id ? "Editar venta" : "Agregar venta"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ overflowY: "auto", overflowX: "hidden", maxHeight: 500 }}
      >
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Cliente"
              name="client"
              rules={[{ required: true, message: 'Cliente requerido.' }]}
            >
              <Input
                value={sale.client}
                onChange={(e) => setSale({ ...sale, client: e.target.value })}
                disabled={disabledInputs}
              />
            </Form.Item>
          </Col>
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <div>Fecha de nacimiento</div>
              <DatePicker
                clearIcon={null}
                value={dayjs(sale.dateBirth === null ? undefined : sale.dateBirth?.toDate())}
                onChange={(date) => setSale({ ...sale, dateBirth: date ? Timestamp.fromDate(date.toDate()) : null })}
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Fecha de nacimiento"
                disabled={disabledInputs}
              />
            </Col>
          }
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[{ required: true, message: 'Teléfono de 10 digitos requerido.', len: 10 }]}
              >
                <Input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  value={sale.phone}
                  onChange={(e) => setSale({ ...sale, phone: e.target.value })}
                  disabled={disabledInputs}
                />
              </Form.Item>
            </Col>
          }
        </Row>
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Teléfono adicional"
              name="additionalPhone"
              rules={[{ required: true, message: 'Teléfono adicional de 10 digitos requerido.', len: 10 }]}
            >
              <Input
                onWheel={(e) => e.currentTarget.blur()}
                type="number"
                value={sale.additionalPhone}
                onChange={(e) => setSale({ ...sale, additionalPhone: e.target.value })}
                disabled={disabledInputs}
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
                disabled={disabledInputs}
                onSearch={setSearchESID}
                value={sale.esid}
                options={optionsClients}
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={(value: string) => {
                  if (value) {
                    let clinet = clients.find(c => c.esid === value);

                    delete clinet?.id;
                    delete clinet?.receives;
                    delete clinet?.sends;
                    delete clinet?.paymentMethod;

                    const _sale = { ...sale, ...clinet } as Sale;

                    setForm(_sale);
                  }
                }}
                onClear={() => setSale({ ...sale, esid: "" })}
              >
                <Input.Search
                  size="middle"
                  placeholder="Buscar ESID"
                  enterButton
                  onSearch={() => onSearchClients(searchESID)}
                />
              </AutoComplete>
            </Form.Item>
            {sale.esid && <div style={{ marginBottom: -10 }}>{clients.find(c => c.esid === sale.esid)?.client}</div>}
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Dirreción"
              name="address"
              rules={[{ required: true, message: 'Dirección requerida.' }]}
            >
              <Input
                disabled={disabledInputs}
                type="text"
                value={sale.address}
                onChange={(e) => setSale({ ...sale, address: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{ marginTop: 10 }}>
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Correo electrónico"
                name="email"
                rules={[{ message: 'Correo electrinico válido requerido.', type: 'email' }]}
              >
                <Input
                  disabled={disabledInputs}
                  type="email"
                  value={sale.email}
                  onChange={(e) => setSale({ ...sale, email: e.target.value })}
                />
              </Form.Item>
            </Col>
          }
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Correo electrónico adicional"
              name="additionalEmail"
              rules={[{ required: true, message: 'Correo electrinico adicional válido requerido.', type: 'email' }]}
            >
              <Input
                disabled={disabledInputs}
                type="email"
                value={sale.additionalEmail}
                onChange={(e) => setSale({ ...sale, additionalEmail: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Estatus de venta"
              name="statusSale"
            >
              <Select
                value={sale.statusSale}
                onChange={value => setSale({ ...sale, statusSale: value })}
                disabled={disabledInputs}
              >
                <Option value="Activación">Activación</Option>
                <Option value="Mensualidad">Mensualidad</Option>
                <Option value="Desconexión">Desconexión</Option>
                <Option value="Devolución">Devolución</Option>
                <Option value="Recuperación">Recuperación</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Estatus de servicio"
              name="statusLight"
            >
              <Select
                disabled={disabledInputs}
                value={sale.statusLight}
                onChange={value => setSale({ ...sale, statusLight: value })}
              >
                <Option value="Con luz">Con luz</Option>
                <Option value="Sin luz">Sin luz</Option>
              </Select>
            </Form.Item>
          </Col>
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Método de pago"
                name="paymentMethod"
              >
                <Select
                  disabled={disabledInputs}
                  value={sale.paymentMethod}
                  onChange={value => setSale({ ...sale, paymentMethod: value })}
                >
                  <Option value="BARRI">BARRI</Option>
                  <Option value="Western union">Western union</Option>
                  <Option value="Ria">Ria</Option>
                  <Option value="Dolex">Dolex</Option>
                  <Option value="Zelle">Zelle</Option>x
                  <Option value="Cashapp">Cashapp</Option>
                  <Option value="MONEY GRAM">MONEY GRAM</Option>
                </Select>
              </Form.Item>
            </Col>
          }
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Número de referencia"
                name="referenceNumber"
              >
                <Input
                  disabled={disabledInputs}
                  type="text"
                  value={sale.referenceNumber}
                  onChange={(e) => setSale({ ...sale, referenceNumber: e.target.value })}
                />
              </Form.Item>
            </Col>
          }
        </Row>
        {
          !hideInputs && <Row gutter={10} style={{ marginTop: 10 }}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Envia"
                name="sends"
              >
                <Input
                  disabled={disabledInputs}
                  type="text"
                  value={sale.sends}
                  onChange={(e) => setSale({ ...sale, sends: e.target.value })}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Recibe"
                name="receives"
              >
                <Select
                  disabled={disabledInputs}
                  onChange={(value) => setSale({ ...sale, receives: value })}
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
                <Select
                  disabled={disabledInputs}
                  value={sale.livingPlace}
                  onChange={value => setSale({ ...sale, livingPlace: value })}
                >
                  <Option value="Casa">Casa</Option>
                  <Option value="Traila">Traila</Option>
                  <Option value="Apartamento">Apartamento</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        }
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Compañia anterior"
              name="previousCompany"
            >
              <Input
                disabled={disabledInputs}
                type="text"
                value={sale.previousCompany}
                onChange={(e) => setSale({ ...sale, previousCompany: e.target.value })}
              />
            </Form.Item>
          </Col>
          {
            !hideInputs && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Cantidad de cobro"
                name="paymentAmount"
                rules={sale.statusSale === "Mensualidad" ? [{ required: true, message: 'Cantidad de cobro requerida.' }] : []}
              >
                <Input
                  disabled={disabledInputs}
                  onWheel={(e) => e.currentTarget.blur()}
                  type="number"
                  value={sale.paymentAmount}
                  onChange={(e) => setSale({ ...sale, paymentAmount: e.target.value })}
                />
              </Form.Item>
            </Col>
          }
          {
            (userFirestore?.role === "Administrador" || !sale.id) && <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Usuario de proceso"
                name="processUser"
              >
                <AutoComplete
                  allowClear
                  disabled={disabledInputs && Boolean(userFirestore?.role !== "Administrador" && sale.processUser && sale.processUser !== userFirestore?.email)}
                  value={sale?.processUser}
                  options={optionsProcessUser}
                  filterOption={(inputValue, option) =>
                    option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={async (value: string) => {
                    setSale({ ...sale, processUser: value });

                    if (sale.id) {
                      await update("sales", sale.id, { processUser: value || "" });
                    }
                  }}
                  placeholder="Buscar usuario proceso"
                  onClear={() => setSale({ ...sale, processUser: "" })}
                />
              </Form.Item>
            </Col>
          }
         
        </Row>
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Campaña"
              name="campaign"
            >
              <Select
                disabled={disabledInputs}
                onChange={(value) => setSale({ ...sale, campaign: value })}
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
          <Col xs={24} sm={24} md={8}>
            <Form.Item
              label="Usuario vendedor"
              name="idSeller"
              rules={[{ required: true, message: 'Usuario vendedor requerido.' }]}
            >
              <AutoComplete
                allowClear
                disabled={disabledInputs && userFirestore?.team !== "ADMIN"}
                value={sale?.idSeller}
                options={optionsSellers}
                filterOption={(inputValue, option) =>
                  option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={(value: string) => setSale({ ...sale, idSeller: value, nameSeller: users.find(option => option.email === value)?.name })}
                placeholder="Buscar usuario vendedor"
                onClear={() => setSale({ ...sale, idSeller: "", nameSeller: "" })}
              />
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
                rows={6}
                value={sale.notes}
                onChange={(e) => setSale({ ...sale, notes: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default HomeDialog;