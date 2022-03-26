import { Rols } from "../types";
import { Timestamp } from "firebase/firestore";

export interface UserFirestore {
  id: string;
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
  id: string;
  userId: string;
  client: string;
  phone: number;
  dateBirth: Timestamp;
  esid: number;
  address: string;
  email?: string;
  additionalEmail: string;
  additionalPhone: number
  statusSale: "Activación" | "Mensualidad";
  statusLight: "Con luz" | "Sin luz";
  status: "Pendiente" | "Finalizada";
};