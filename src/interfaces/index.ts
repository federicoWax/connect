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

export interface Sale {
  id?: string;
  userId?: string;
  client: string;
  phone?: string;
  dateBirth: Timestamp | null;
  esid?: number;
  address: string;
  email?: string;
  additionalEmail?: string;
  additionalPhone?: string;
  statusSale: "Activación" | "Mensualidad";
  statusLight: "Con luz" | "Sin luz";
  date: Timestamp | null;
  concluded: boolean;
  paymentMethod: "BARRI" | "Western union" | "Ria" | "Dolex" | "Zelle" | "Cashapp" | "";
  referenceNumber?: string;
  sends: string;
  receives: string;
  livingPlace: "Casa" | "Traila" | "Apartamento" | "";
  previousCompany: string;
};

export interface FilterSale {
  concluded: boolean;
  startDate: null | moment.Moment;
  endDate: null | moment.Moment;
  userId?: string;
};