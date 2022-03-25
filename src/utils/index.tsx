import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal } from "antd";

export const dialogDeleteDoc = (fun: Promise<void>) => {
  Modal.confirm({
    title: 'Eliminar',
    icon: <ExclamationCircleOutlined />,
    content: 'Seguro que deseas eliminar este registro?',
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    onOk: async () => {
      await fun;
      message.success("Registro eliminado con exito!");
    },
  });
}