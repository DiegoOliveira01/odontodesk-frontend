import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signal que controla se a sidebar está recolhida ou expandida
  isCollapsed = signal<boolean>(false);

  // Items de navegação
  navItems: NavItem[] = [
    { label: 'Dashboard',    route: '/dashboard',    icon: 'grid' },
    { label: 'Pacientes',    route: '/patients',     icon: 'users' },
    { label: 'Dentistas',    route: '/dentists',     icon: 'user-check' },
    { label: 'Procedimentos',route: '/procedures',   icon: 'clipboard' },
    { label: 'Consultas',    route: '/appointments', icon: 'calendar' },
  ];

  toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}