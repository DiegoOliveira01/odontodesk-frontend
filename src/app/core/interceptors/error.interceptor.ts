import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {

        case 401:
          // Token expirado ou inválido — desloga e redireciona
          authService.logout();
          router.navigate(['/login']);
          break;

        case 403:
          // Sem permissão — redireciona para o dashboard
          router.navigate(['/dashboard']);
          break;

        case 0:
          // Sem conexão com o servidor
          console.error('Servidor indisponível');
          break;

        default:
          console.error(`Erro ${error.status}: ${error.message}`);
      }

      // Propaga o erro para o componente tratar se necessário
      return throwError(() => error);
    })
  );
};