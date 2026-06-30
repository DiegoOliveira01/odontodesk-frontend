// src/app/core/services/procedure-service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Procedure, ProcedureRequest } from '../models/procedure.model';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ProcedureService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/procedures`;

  findAll(name?: string): Observable<Procedure[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    return this.http.get<Procedure[]>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Procedure> {
    return this.http.get<Procedure>(`${this.apiUrl}/${id}`);
  }

  create(dto: ProcedureRequest): Observable<Procedure> {
    return this.http.post<Procedure>(this.apiUrl, dto);
  }

  update(id: number, dto: ProcedureRequest): Observable<Procedure> {
    return this.http.put<Procedure>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}