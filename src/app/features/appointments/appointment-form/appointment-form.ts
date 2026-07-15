import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment-service';
import { PatientService } from '../../../core/services/patient-service';
import { DentistService } from '../../../core/services/dentist-service';
import { ProcedureService } from '../../../core/services/procedure-service';
import { Patient } from '../../../core/models/patient.model';
import { Dentist } from '../../../core/models/dentist.model';
import { Procedure } from '../../../core/models/procedure.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-form.html'
})
export class AppointmentForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);
  private readonly dentistService = inject(DentistService);
  private readonly procedureService = inject(ProcedureService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  appointmentId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  patients = signal<Patient[]>([]);
  dentists = signal<Dentist[]>([]);
  procedures = signal<Procedure[]>([]);

  appointmentForm: FormGroup = this.fb.group({
    patientId: [null, Validators.required],
    dentistId: [null, Validators.required],
    scheduledAt: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(15)]],
    notes: [''],
    // FormArray de checkboxes — um item por procedimento disponível
    procedures: this.fb.array([])
  });

  get proceduresArray(): FormArray {
    return this.appointmentForm.get('procedures') as FormArray;
  }

  ngOnInit(): void {
    // Carrega as três listas de apoio em paralelo
    this.patientService.findAll().subscribe(data => this.patients.set(data));
    this.dentistService.findAll().subscribe(data => this.dentists.set(data));
    this.procedureService.findAll().subscribe(data => {
      this.procedures.set(data);
      this.buildProceduresArray(data);

      // Só depois que o array de checkboxes existe é que carregamos
      // a consulta (modo edição) ou a data prée-selecionada (modo criação)
      this.initFormMode();
    });
  }

  // Monta um FormGroup por procedimento: { procedureId, selected, quantity }
  private buildProceduresArray(procedures: Procedure[]): void {
    procedures.forEach(proc => {
      this.proceduresArray.push(
        this.fb.group({
          procedureId: [proc.id],
          selected: [false],
          quantity: [1, Validators.min(1)]
        })
      );
    });
  }

  private initFormMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.appointmentId.set(Number(id));
      this.isEditMode.set(true);
      this.loadAppointment(Number(id));
      return;
    }

    // Modo criação — verifica se veio uma data do clique no calendário
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      // Formata para o input datetime-local: "yyyy-MM-ddTHH:mm"
      const localDatetime = dateParam.slice(0, 16);
      this.appointmentForm.patchValue({ scheduledAt: localDatetime });
    }
  }

  private loadAppointment(id: number): void {
    this.isLoading.set(true);
    this.appointmentService.findById(id).subscribe({
      next: (appt) => {
        this.appointmentForm.patchValue({
          patientId: appt.patient.id,
          dentistId: appt.dentist.id,
          scheduledAt: appt.scheduledAt.slice(0, 16),
          durationMinutes: appt.durationMinutes,
          notes: appt.notes
        });

        // Marca os checkboxes dos procedimentos que já estavam na consulta
        appt.procedures.forEach(ap => {
          const group = this.proceduresArray.controls.find(
            c => c.get('procedureId')?.value === ap.procedure.id
          );
          if (group) {
            group.patchValue({ selected: true, quantity: ap.quantity });
          }
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Consulta não encontrada');
      }
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.appointmentForm.value;

    // Filtra só os procedimentos marcados e remove o campo "selected"
    const selectedProcedures = formValue.procedures
      .filter((p: any) => p.selected)
      .map((p: any) => ({
        procedureId: p.procedureId,
        quantity: p.quantity
      }));

    const payload = {
      patientId: formValue.patientId,
      dentistId: formValue.dentistId,
      scheduledAt: formValue.scheduledAt,
      durationMinutes: formValue.durationMinutes,
      notes: formValue.notes,
      procedures: selectedProcedures
    };

    const request$ = this.isEditMode()
      ? this.appointmentService.update(this.appointmentId()!, payload)
      : this.appointmentService.create(payload);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/appointments']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (err.status === 409) {
          this.errorMessage.set(err.error?.message ?? 'Conflito de horário');
        } else if (err.status === 400 && err.error?.fieldErrors) {
          const firstError = Object.values(err.error.fieldErrors)[0];
          this.errorMessage.set(firstError as string);
        } else if (err.status === 404) {
          this.errorMessage.set('Paciente, dentista ou procedimento não encontrado');
        } else {
          this.errorMessage.set('Erro ao salvar consulta');
        }
      }
    });
  }
}