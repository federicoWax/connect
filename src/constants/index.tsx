import { Excel, PaymentMethod, Permission } from "../interfaces";

export const startDateStartDay = new Date();
startDateStartDay.setHours(0);
startDateStartDay.setMinutes(0);
startDateStartDay.setSeconds(0);
startDateStartDay.setMilliseconds(0);


export const endDateEndDay = new Date();
endDateEndDay.setHours(23);
endDateEndDay.setMinutes(59);
endDateEndDay.setSeconds(59);
endDateEndDay.setMilliseconds(59);

export const initPermisions: Permission[] = [
  {
    module: "Ventas",
    route: "/ventas",
    read: false,
    write: false
  },
  {
    module: "Clientes",
    route: "/clientes",
    read: false,
    write: false
  },
  {
    module: "Cobradores",
    route: "/cobradores",
    read: false,
    write: false
  },
  {
    module: "Campañas",
    route: "/campanas",
    read: false,
    write: false
  },
  {
    module: "Usuarios",
    route: "/usuarios",
    read: false,
    write: false
  },
  {
    module: "Equipos",
    route: "/equipos",
    read: false,
    write: false
  },
  {
    module: "Sucursales",
    route: "/sucursales",
    read: false,
    write: false
  },
  {
    module: "Asistencias",
    route: "/asistencias",
    read: false,
    write: false
  },
  {
    module: "Exceles",
    route: "/exceles",
    read: false,
    write: false
  },
  {
    module: "Metodos de pago",
    route: "/metodos-de-pago",
    read: false,
    write: false
  },
];

export const initExcel: Excel = {
  name: "",
  userIds: [],
  userRows: [],
  file: "",
  campaniaE: [],
  campaniaF: [],
  campaniaG: [],
  campaniaH: [],
  campaniaI: [],
  activeUsers: [],
  active: true
};

export const colorTagsExcel = [
  "#000000", "#0000FF", "#8A2BE2", "#A52A2A", "#5F9EA0", "#D2691E", "#DC143C", "#00008B", "#008B8B", "#008B8B",
  "#006400", "#8B008B", "#9932CC", "#8B0000", "#483D8B", "#2F4F4F", "#9400D3", "#008000", "#4B0082", "#800000",
  "#191970", "#000080", "#800080", "#8B4513", "#6A5ACD", "#008080", "#8B0000", "#C71585", "#DB7093", "#FF4500",
  "#FF8C00", "#BDB76B", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2",
  "#4B0082", "#32CD32", "#3CB371", "#2E8B57", "#6B8E23", "#20B2AA", "#008B8B", "#5F9EA0", "#1E90FF", "#7B68EE"
];

export const columnsTableExcel = [
  {
    width: 20,
    header: 'Usuario',
    key: 'userName',
  },
  {
    width: 20,
    header: 'First Name',
    key: 'firstName',
  },
  {
    width: 20,
    header: 'Last Name',
    key: 'lastName',
  },
  {
    width: 20,
    header: 'SNN',
    key: 'snn',
  },
  {
    width: 20,
    header: 'DOB',
    key: 'dob',
  },
  {
    width: 20,
    header: 'Compañia',
    key: 'e',
  },
  {
    width: 20,
    header: 'Compañia',
    key: 'f',
  },
  {
    width: 20,
    header: 'Compañia',
    key: 'g',
  },
  {
    width: 20,
    header: 'Compañia',
    key: 'h',
  },
  {
    width: 20,
    header: 'Compañia',
    key: 'i',
  }
];

export const columnsExcel = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export const initPaymentMethod: PaymentMethod = {
  name: "",
};
