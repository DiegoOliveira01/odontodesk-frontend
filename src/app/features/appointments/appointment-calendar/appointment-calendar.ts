import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../../core/services/appointment-service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

// Mapeia cada status para uma cor — usado nos eventos do calendário
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  AGENDADA: '#3b82f6',    // azul
  CONFIRMADA: '#10b981',  // verde
  CANCELADA: '#ef4444',   // vermelho
  CONCLUIDA: '#6b7280',   // cinza
};

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [FullCalendarModule, FormsModule, RouterLink],
  templateUrl: './appointment-calendar.html'
})
export class AppointmentCalendar {

  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  // Consulta selecionada para exibir no modal de detalhes
  selectedAppointment = signal<Appointment | null>(null);
  isUpdatingStatus = signal<boolean>(false);
  statusError = signal<string | null>(null);

  allAppointments: Appointment[] = [];

  // Todos os status possíveis — usados no dropdown do modal
  readonly statusOptions: AppointmentStatus[] = [
    'AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA'
  ];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'pt-br',
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },
    selectable: true,
    editable: false,
    events: [],
    eventClick: (arg) => this.onEventClick(arg),
    select: (arg) => this.onDateSelect(arg),
    height: 'auto',
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00'
  };

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.findAll().subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: appointments.map(appt => this.toCalendarEvent(appt))
        };
      }
    });
  }

  private toCalendarEvent(appt: Appointment) {
    const start = new Date(appt.scheduledAt);
    const end = new Date(start.getTime() + appt.durationMinutes * 60000);

    return {
      id: String(appt.id),
      title: `${appt.patient.name} — Dr(a). ${appt.dentist.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: STATUS_COLORS[appt.status],
      borderColor: STATUS_COLORS[appt.status]
    };
  }

  // Clicar num evento existente — abre o modal de detalhes
  onEventClick(arg: EventClickArg): void {
    const id = Number(arg.event.id);
    const appointment = this.allAppointments.find(a => a.id === id);
    if (appointment) {
      this.statusError.set(null);
      this.selectedAppointment.set(appointment);
    }
  }

  // Clicar/arrastar numa data vazia — vai para o formulário de criação com a data pré-preenchida
  onDateSelect(arg: DateSelectArg): void {
    this.router.navigate(['/appointments/new'], {
      queryParams: { date: arg.startStr }
    });
  }

  closeModal(): void {
    this.selectedAppointment.set(null);
    this.statusError.set(null);
  }

  goToEdit(): void {
    const appt = this.selectedAppointment();
    if (appt) {
      this.router.navigate(['/appointments', appt.id, 'edit']);
    }
  }

  // Chamado quando o dropdown de status do modal muda
  onStatusChange(newStatus: AppointmentStatus): void {
    const appt = this.selectedAppointment();
    if (!appt || newStatus === appt.status) return;

    this.isUpdatingStatus.set(true);
    this.statusError.set(null);

    this.appointmentService.updateStatus(appt.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.isUpdatingStatus.set(false);
        this.selectedAppointment.set(updated);
        this.loadAppointments(); // atualiza as cores no calendário
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.statusError.set(
          err.error?.message ?? 'Não foi possível atualizar o status'
        );
      }
    });
  }

  deleteAppointment(): void {
    const appt = this.selectedAppointment();
    if (!appt) return;

    if (!confirm(`Excluir a consulta de ${appt.patient.name}?`)) return;

    this.appointmentService.delete(appt.id).subscribe({
      next: () => {
        this.closeModal();
        this.loadAppointments();
      }
    });
  }
}