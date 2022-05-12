import { FC, useEffect, useState, memo } from "react";
import { Col, Form, Input, message, Modal, Row } from "antd";
import { Branch, Team } from "../../interfaces";
import { add, update } from "../../services/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  propBranch: Branch | null;
};

const initBranch: Branch = {
  name: ""
};

const BranchDialog: FC<Props> = ({open, onClose, propBranch}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [branch, setBranch] = useState<Branch>(initBranch);
  const [form] = Form.useForm();

  useEffect(() => {
    if(propBranch) {
      form.setFieldsValue(propBranch);
      setBranch(propBranch);
    }
  }, [form, propBranch]);

  const save = async () => {
    if(saving) return;

    setSaving(true);

    const id = branch.id;
    let _branch = {...branch};     
    delete _branch.id;

    try {
      id ? await update("branchs", id, _branch ) : await add('branchs', _branch);

      message.success("Sucursal guardada con exito!");
    } catch (error) {
      console.log(error);
      setSaving(false);
    } finally {
      setSaving(false);
      resetForm();
    }
  }

  const resetForm = () => {
    onClose();
    form.resetFields();
    setBranch(initBranch);
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
      title={branch.id ? "Editar sucursal" : "Agregar sucursal"}
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
                value={branch.name} 
                onChange={(e) => setBranch({...branch, name: e.target.value})}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default memo(BranchDialog);