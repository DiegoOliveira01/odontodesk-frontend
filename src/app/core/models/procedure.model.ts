export interface Procedure {
  id: number;
  name: string;
  description?: string;
  estimatedDurationMinutes?: number;
  price?: number;
}

export interface ProcedureRequest {
  name: string;
  description?: string;
  estimatedDurationMinutes?: number;
  price?: number;
}