import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se não tem token, deixa a requisição passar sem modificar
  // O backend vai retornar 403 se a rota exigir autenticação
  if (!token) {
    return next(req);
  }

  // Clona a requisição adicionando o header Authorization
  // Clona porque requisições HTTP são imutáveis no Angular
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq);
};