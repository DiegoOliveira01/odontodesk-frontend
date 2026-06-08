import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signal que guarda o estado de autenticação
  // Qualquer componente pode ler isso sem precisar de Subject/BehaviorSubject
  readonly isAuthenticated = signal<boolean>(this.hasValidToken());
  readonly currentUserEmail = signal<string | null>(this.getStoredEmail());
  readonly currentUserRole = signal<string | null>(this.getStoredRole());

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    // Atualiza os signals
    this.isAuthenticated.set(false);
    this.currentUserEmail.set(null);
    this.currentUserRole.set(null);

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Lida com o sucesso do login/register
  // Salva o token e atualiza os signals
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);

    this.isAuthenticated.set(true);
    this.currentUserEmail.set(response.email);
    this.currentUserRole.set(response.role);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getStoredEmail(): string | null {
    return localStorage.getItem('email');
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('role');
  }
}