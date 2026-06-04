export interface Dentist {
  id: number;
  name: string;
  cro: string;
  specialty?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface DentistRequest {
  name: string;
  cro: string;
  specialty?: string;
  phone?: string;
  email?: string;
}