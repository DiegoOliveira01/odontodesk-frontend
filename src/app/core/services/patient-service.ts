// src/app/core/services/patient-service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, PatientRequest } from '../models/patient.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class PatientService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/patients`;

  findAll(name?: string): Observable<Patient[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    return this.http.get<Patient[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(dto: PatientRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, dto);
  }

  update(id: number, dto: PatientRequest): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}