import { Rols } from "../types";
import { Timestamp } from "firebase/firestore";

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
  statusSale?: "Activación" | "Mensualidad" | "Desconexión";
  referenceNumber?: string;
  concluded: boolean;
  paymentAmount: string;
  processUser?: string;
  paymentMethod: "BARRI" | "Western union" | "Ria" | "Dolex" | "Zelle" | "Cashapp" | "";
  sends: string;
  receives: string;
};

export interface FilterSale {
  concluded: boolean;
  startDate: null | moment.Moment;
  endDate: null | moment.Moment;
  userId?: string;
  esid?: string;
  processUser?: string;
};

export interface Cobrador {
  id?: string;
  name: string;
}

export interface Campaign extends Cobrador {

}

export interface Autocomplete {
  value: string;
  label: string;
}