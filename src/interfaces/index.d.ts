import { Rols } from "../types";
import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import { RcFile } from "antd/es/upload";

export interface Permission {
  module: string;
  route: string;
  read: boolean;
  write: boolean;
}
export interface UserFirestoreAuth {
  id: string;
  email: string;
  role: Rols;
  team: string;
  branch: string;
  permissions: Permission[];
}
export interface UserFirestore {
  id?: string;
  email: string;
  password?: string;
  passwordConfirm? : string;
  role: Rols;
  name: string;
  phone: string;
  city: string;
  team: string;
  branch: string;
};

export interface Client {
  id?: string;
  esid?: string;
  phone?: string;
  address: string;
  email: string;
  client: string;
  dateBirth: Timestamp | null;
  additionalEmail?: string;
  additionalPhone?: string;
  statusLight: "Con luz" | "Sin luz" | "";
  livingPlace: "Casa" | "Traila" | "Apartamento" | "";
  previousCompany: string;
  notes: string;
  campaign: string;
  receives?: string;
  sends?: string;
  paymentMethod?: "BARRI" | "Western union" | "Ria" | "Dolex" | "Zelle" | "Cashapp" | "";
}

export interface Sale extends Client {
  userId?: string;
  date?: Timestamp | null | dayjs.Dayjs;
  datePayment?: Timestamp | null | dayjs.Dayjs;
  dateConclued?: Timestamp | null | dayjs.Dayjs;
  statusSale?: "Activación" | "Mensualidad" | "Desconexión" | "Devolución";
  referenceNumber?: string;
  concluded: boolean;
  paymentAmount: string;
  processUser?: string;
  sends: string;
  receives: string;
  team?: string;
  idSeller?: string;
  nameSeller?: string;
};

export interface FilterSale {
  concluded: boolean | "";
  startDate: null | dayjs.Dayjs;
  endDate: null | dayjs.Dayjs;
  userId?: string;
  esid?: string;
  processUser?: string;
  statusPayment: boolean | "";
  campaignId: string;
  teamId: string;
  statusLight: "Con luz" | "Sin luz" | "";
  typeDate: "datePayment" | "date" | "dateConclued";
  fieldsClient: "phone" | "esid"
};

export interface Cobrador {
  id?: string;
  name: string;
}

export interface Campaign extends Cobrador {}

export interface Team extends Cobrador {
  permissions?: Permission[];
}

export interface Center {
  lat: number;
  lng: number;
}
export interface Branch {
  id?: string;
  name: string;
  center?: Position;
  radius?: number;
}
export interface Autocomplete {
  value: string;
  label: string;
}

export interface Assistence {
  id?: string;
  date: Timestamp;
  userId: string;
  name?: string;
  email?: string;
  team?: string;
  typeRegister?:" ENTRADA" | "SALIDA A COMIDA" | "ENTRADA DE COMIDA" | "SALIDA",
}

export interface Position {
  lat: number;
  lng: number;
}

export interface FilterAssists {  
  startDate: null | dayjs.Dayjs;
  endDate: null | dayjs.Dayjs;
}

export interface ActiveUser {
  lastUpdate: Date | Timestamp;
  userId: string;
  active: boolean;
  color: string;
  user?: UserFirestore;
}

export interface Excel {
  id?: string;
  name: string;
  file?: string | RcFile;
  userIds: string[];
  userRows: string[];
  campaniaE: string[];
  campaniaF: string[];
  campaniaG: string[];
  campaniaH: string[];
  campaniaI: string[];
  activeUsers: ActiveUser[];
  active: boolean;
}

export interface HistoryExcel {
  id?: string;
  excelId: string;
  userId: string;
  value: string;
  row: number;
  col: string;
  date: Date;
}

export interface RowTableExcel {
  index: number;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  snn: string;
  dob: string;
  e: string;
  f: string;
  g: string;
  h: string;
  i: string;
  selecting: boolean;
}