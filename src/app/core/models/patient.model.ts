export interface Patient {
  id: number;
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  createdAt: string;
}

export interface PatientRequest {
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
}