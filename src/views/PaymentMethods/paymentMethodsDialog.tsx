import { FC, useEffect, useState } from "react";
import { Col, Form, Input, message, Modal, Row } from "antd";
import { PaymentMethod } from "../../interfaces";
import { add, update } from "../../services/firebase";
import { initPaymentMethod } from "../../constants";

interface Props {
  open: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod;
};

const PaymentMethodsDialog: FC<Props> = ({ open, onClose, paymentMethod: paymentMethodProp }) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initPaymentMethod);
  const [form] = Form.useForm();

  useEffect(() => {
    if (paymentMethodProp) {
      form.setFieldsValue(paymentMethodProp);
      setPaymentMethod(paymentMethodProp);

      return;
    }

    form.setFieldsValue(initPaymentMethod);
  }, [form, paymentMethodProp]);

  const save = async () => {
    if (saving) return;

    setSaving(true);

    const id = paymentMethod.id;
    let _paymentMethod = { ...paymentMethod };
    delete _paymentMethod.id;

    try {
      id ? await update("paymentMethods", id, _paymentMethod) : await add('paymentMethods', _paymentMethod);

      message.success("Metodo de pago guardado con exito!");
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
    setPaymentMethod(initPaymentMethod);
    onClose();
  };

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
          .catch(() => { });
      }}
      title={paymentMethod.id ? "Editar metodo de pago" : "Agregar metodo de pago"}
      cancelText="Cancelar"
      okText="Guardar"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ overflowY: "auto", overflowX: "hidden", maxHeight: 500 }}
      >
        <Row gutter={10} style={{ marginTop: 10 }}>
          <Col xs={24} sm={24} md={24}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: 'Nombre requerido.' }]}
            >
              <Input
                value={paymentMethod.name}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, name: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PaymentMethodsDialog;