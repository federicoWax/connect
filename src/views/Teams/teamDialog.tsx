import { FC, useEffect, useState } from "react";
import { Col, Form, Input, message, Modal, Row } from "antd";
import { Team } from "../../interfaces";
import { add, update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propTeam: Team | null;
};

const init_team: Team = {
  name: ""
};

const TeamDialog: FC<Props> = ({open, onClose, propTeam}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [team, setTeam] = useState<Team>(init_team);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propTeam) {
      form.setFieldsValue(propTeam);
      setTeam(propTeam);
    }
  }, [form, propTeam]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = team.id;
    let _team = {...team};     
    delete _team.id;

    try {
      id ? await update("teams", id, _team ) : await add('teams', _team);

      message.success("Equipo guardado con exito!");
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
    setTeam(init_team);
    onClose();
  }

  return (
   <Modal
      forceRender 
      destroyOnClose={true}
      confirmLoading={saving}
      open={open}
      onCancel={resetForm}
      onOk={() => {
        form.validateFields()
          .then(save)
          .catch(() => {});
      }}
      title={team.id ? "Editar equipo" : "Agregar equipo"}
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
                value={team.name} 
                onChange={(e) => setTeam({...team, name: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default TeamDialog;