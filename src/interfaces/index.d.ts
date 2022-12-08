import { Rols } from "../types";
import { Timestamp } from "firebase/firestore";

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
  date?: Timestamp | null | moment.Moment;
  datePayment?: Timestamp | null | moment.Moment;
  dateConclued?: Timestamp | null | moment.Moment;
  statusSale?: "Activación" | "Mensualidad" | "Desconexión" | "Devolución";
  referenceNumber?: string;
  concluded: boolean;
  paymentAmount: string;
  processUser?: string;
  paymentMethod: "BARRI" | "Western union" | "Ria" | "Dolex" | "Zelle" | "Cashapp" | "";
  sends: string;
  receives: string;
  team?: string;
};

export interface FilterSale {
  concluded: boolean | null;
  startDate: null | moment.Moment;
  endDate: null | moment.Moment;
  userId?: string;
  esid?: string;
  processUser?: string;
  statusPayment: Boolean | null;
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
  startDate: null | moment.Moment;
  endDate: null | moment.Moment;
}