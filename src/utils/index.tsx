import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal } from "antd";
import dayjs from "dayjs";
import exceljs from "exceljs";

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

export const getWorkbookFromFile = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = async () => {
    let workbook = new exceljs.Workbook();
    workbook = await workbook.xlsx.load(reader.result as ArrayBuffer)
    resolve(workbook);
  }
  
  reader.onerror = () => {
    reject();
  }
});