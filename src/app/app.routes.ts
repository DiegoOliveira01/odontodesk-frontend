import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: '',
    // Layout principal — sidebar + navba
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],  // protege todas as rotas filhas
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'patients',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/patients/patient-list/patient-list')
                .then(m => m.PatientList)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/patients/patient-form/patient-form')
                .then(m => m.PatientForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/patients/patient-form/patient-form')
                .then(m => m.PatientForm)
          }
          ]
        },
      {
        path: 'dentists',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/dentists/dentist-list/dentist-list')
                .then(m => m.DentistList)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/dentists/dentist-form/dentist-form')
                .then(m => m.DentistForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/dentists/dentist-form/dentist-form')
                .then(m => m.DentistForm)
          }
        ]
      },
      {
        path: 'procedures',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/procedures/procedure-list/procedure-list')
                .then(m => m.ProcedureList)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/procedures/procedure-form/procedure-form')
                .then(m => m.ProcedureForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/procedures/procedure-form/procedure-form')
                .then(m => m.ProcedureForm)
          }
        ]
      },
      {
        path: 'appointments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/appointments/appointment-calendar/appointment-calendar')
                .then(m => m.AppointmentCalendar)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/appointments/appointment-form/appointment-form')
                .then(m => m.AppointmentForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/appointments/appointment-form/appointment-form')
                .then(m => m.AppointmentForm)
          }
        ]
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
