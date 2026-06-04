export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export type UserRole = 'ADMIN' | 'DENTIST' | 'RECEPTIONIST';