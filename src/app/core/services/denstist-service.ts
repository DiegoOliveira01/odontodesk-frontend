// src/app/core/services/dentist-service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dentist, DentistRequest } from '../models/dentist.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class DentistService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dentists`;

  findAll(name?: string, specialty?: string): Observable<Dentist[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (specialty) params = params.set('specialty', specialty);
    return this.http.get<Dentist[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Dentist> {
    return this.http.get<Dentist>(`${this.apiUrl}/${id}`);
  }

  create(dto: DentistRequest): Observable<Dentist> {
    return this.http.post<Dentist>(this.apiUrl, dto);
  }

  update(id: number, dto: DentistRequest): Observable<Dentist> {
    return this.http.put<Dentist>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}