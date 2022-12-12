import { Excel, Permission } from "../interfaces";

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
];

export const initExcel: Excel = {
  name: "",
  userIds: [],
  file: "",
  campaniaE: [],
  campaniaF: [],
  campaniaG: [],
  campaniaH: [],
  campaniaI: [],
} 
