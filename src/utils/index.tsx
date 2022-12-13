import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal } from "antd";
import dayjs from "dayjs";

export const dialogDeleteDoc = (fun: () => Promise<unknown>) => {
  return new Promise((resolve) => {
    return Modal.confirm({
      title: 'Eliminar',
      icon: <ExclamationCircleOutlined />,
      content: '¿Seguro que deseas eliminar este registro?',
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      onOk: async () => {
        await fun();
        message.success("Registro eliminado con exito!");
        resolve(true);
      },
    });
  })
}
 

export const dayjsToStartDay = (dj: dayjs.Dayjs) => {
  dj.set("hour", 0);
  dj.set("minute", 0);
  dj.set("second", 0)
  dj.set("millisecond", 0);

  return dj;
} 

export const dayjsToEndDay = (dj: dayjs.Dayjs) => {
  dj.set("hour", 23);
  dj.set("minute", 59);
  dj.set("second", 59)
  dj.set("millisecond", 59);

  return dj;
} 