import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PatientService } from '../../core/services/patient-service';
import { DentistService } from '../../core/services/dentist-service';
import { AppointmentService } from '../../core/services/appointment-service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html'
})
export class Dashboard {

  private readonly patientService = inject(PatientService);
  private readonly dentistService = inject(DentistService);
  private readonly appointmentService = inject(AppointmentService);

  totalPatients = signal<number>(0);
  totalDentists = signal<number>(0);
  allAppointments = signal<Appointment[]>([]);
  isLoading = signal<boolean>(true);

  // Consultas de hoje
  todayAppointments = computed(() => {
    const today = new Date().toDateString();
    return this.allAppointments().filter(
      appt => new Date(appt.scheduledAt).toDateString() === today
    );
  });

  // Consultas deste mês
  monthAppointments = computed(() => {
    const now = new Date();
    return this.allAppointments().filter(appt => {
      const d = new Date(appt.scheduledAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  });

  // As 5 próximas consultas a partir de agora, ordenadas
  upcomingAppointments = computed(() => {
    const now = new Date();
    return this.allAppointments()
      .filter(appt => new Date(appt.scheduledAt) >= now && appt.status !== 'CANCELADA')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);
  });

  // Contagem por status
  statusCounts = computed(() => {
    const counts: Record<AppointmentStatus, number> = {
      AGENDADA: 0, CONFIRMADA: 0, CANCELADA: 0, CONCLUIDA: 0
    };
    this.allAppointments().forEach(appt => counts[appt.status]++);
    return counts;
  });

  constructor() {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.patientService.findAll().subscribe(data => this.totalPatients.set(data.length));
    this.dentistService.findAll().subscribe(data => this.totalDentists.set(data.length));
    this.appointmentService.findAll().subscribe({
      next: (data) => {
        this.allAppointments.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}