import { Rols } from "../types";

export interface UserFirestore {
  id: string;
  email: string,
  password?: string,
  passwordConfirm? : string,
  role: Rols,
  name: string,
  phone: string,
  city: string,
  team: string,
};