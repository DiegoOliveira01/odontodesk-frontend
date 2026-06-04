import { Patient } from './patient.model';
import { Dentist } from './dentist.model';
import { Procedure } from './procedure.model';

export type AppointmentStatus =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'CONCLUIDA';

export interface AppointmentProcedure {
  id: number;
  procedure: Procedure;
  quantity: number;
}

export interface Appointment {
  id: number;
  patient: Patient;
  dentist: Dentist;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  procedures: AppointmentProcedure[];
  createdAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  dentistId: number;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  procedures?: AppointmentProcedureRequest[];
}

export interface AppointmentProcedureRequest {
  procedureId: number;
  quantity: number;
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
}