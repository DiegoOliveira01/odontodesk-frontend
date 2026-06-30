// src/app/core/services/appointment-service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  AppointmentRequest,
  AppointmentStatusUpdate
} from '../models/appointment.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  findAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  findById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  findByDentist(dentistId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/dentist/${dentistId}`);
  }

  findByDentistAndDateRange(
    dentistId: number,
    start: string,
    end: string
  ): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/dentist/${dentistId}/range`, { params }
    );
  }

  create(dto: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, dto);
  }

  update(id: number, dto: AppointmentRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, dto);
  }

  updateStatus(id: number, dto: AppointmentStatusUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/status`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}