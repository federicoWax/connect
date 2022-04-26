import { FC, useEffect, useState } from "react";
import { Col, Form, Input, message, Modal, Row } from "antd";
import { Campaign } from "../../interfaces";
import { add, update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propCampaign: Campaign | null;
};

const init_campaign: Campaign = {
  name: ""
};

const CampaignDialog: FC<Props> = ({open, onClose, propCampaign}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign>(init_campaign);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propCampaign) {
      form.setFieldsValue(propCampaign);
      setCampaign(propCampaign);

      return;
    }

    form.setFieldsValue(init_campaign);
  }, [form, propCampaign]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = campaign.id;
    let _campaign= {...campaign};    

    delete _campaign.id;

    try {
      id ? await update("campaigns", id, _campaign ) : await add('campaigns', _campaign);

      message.success("Camapaña guardada con exito!");
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
    setCampaign(init_campaign);
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
      title={campaign.id ? "Editar campaña" : "Agregar campaña"}
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
                value={campaign.name} 
                onChange={(e) => setCampaign({...campaign, name: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default CampaignDialog;