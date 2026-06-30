import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Lê o email do usuário logado do signal do AuthService
  userEmail = this.authService.currentUserEmail;
  userRole = this.authService.currentUserRole;

  // Converte o evento de navegação em signal para mostrar o título da página
  pageTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getTitleFromRoute(this.router.url))
    ),
    { initialValue: this.getTitleFromRoute(this.router.url) }
  );

  private getTitleFromRoute(url: string): string {
    const titles: Record<string, string> = {
      '/dashboard':    'Dashboard',
      '/patients':     'Pacientes',
      '/dentists':     'Dentistas',
      '/procedures':   'Procedimentos',
      '/appointments': 'Consultas',
    };

    // Pega a rota base ignorando parâmetros
    const baseRoute = '/' + url.split('/')[1];
    return titles[baseRoute] ?? 'OdontoDesk';
  }
}