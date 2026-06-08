import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    // Layout principal — sidebar + navbar
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],  // protege todas as rotas filhas
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patients/patient-list/patient-list.component')
            .then(m => m.PatientListComponent)
      },
      {
        path: 'dentists',
        loadComponent: () =>
          import('./features/dentists/dentist-list/dentist-list.component')
            .then(m => m.DentistListComponent)
      },
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/procedures/procedure-list/procedure-list.component')
            .then(m => m.ProcedureListComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list.component')
            .then(m => m.AppointmentListComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
