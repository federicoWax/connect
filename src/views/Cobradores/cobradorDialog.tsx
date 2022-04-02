import { FC, useEffect, useState } from "react";
import { Col, Form, Input, message, Modal, Row } from "antd";
import { Cobrador } from "../../interfaces";
import { add, update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propColaborador: Cobrador | null;
};

const init_cobrador: Cobrador = {
  name: ""
};

const HomeDialog: FC<Props> = ({open, onClose, propColaborador}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [cobrador, setCobrador] = useState<Cobrador>(init_cobrador);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propColaborador) {
      form.setFieldsValue(propColaborador);
      setCobrador(propColaborador);

      return;
    }

    form.setFieldsValue(init_cobrador);
  }, [form, propColaborador]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = cobrador.id;
    let _cobrador = {...cobrador};     
    delete _cobrador.id;

    try {
      id ? await update("cobradores", id, _cobrador ) : await add('cobradores', _cobrador);

      message.success("Cobrador guardado con exito!");
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
    setCobrador(init_cobrador);
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
      title={cobrador.id ? "Editar cobrador" : "Agregar cobrador"}
      cancelText="Cancelar"
      okText="Guardar"
    >
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
                value={cobrador.name} 
                onChange={(e) => setCobrador({...cobrador, name: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default HomeDialog;