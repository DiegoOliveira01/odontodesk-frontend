import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './patient-form.html'
})
export class PatientForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signal que guarda o id quando está em modo edição — null em modo criação
  patientId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  patientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    phone: [''],
    email: ['', Validators.email],
    birthDate: [''],
    address: ['']
  });

  ngOnInit(): void {
    // Lê o :id da URL — se existir, é modo edição
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.patientId.set(Number(id));
      this.isEditMode.set(true);
      this.loadPatient(Number(id));
    }
  }

  private loadPatient(id: number): void {
    this.isLoading.set(true);
    this.patientService.findById(id).subscribe({
      next: (patient) => {
        this.patientForm.patchValue({
          name: patient.name,
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          birthDate: patient.birthDate,
          address: patient.address
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Paciente não encontrado!');
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEditMode()
      ? this.patientService.update(this.patientId()!, this.patientForm.value)
      : this.patientService.create(this.patientForm.value);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/patients']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (err.status === 422) {
          this.errorMessage.set(err.error?.message ?? 'Erro de validação');
        } else if (err.status === 400 && err.error?.fieldErrors) {
          // Mostra o primeiro erro de campo retornado pelo backend
          const firstError = Object.values(err.error.fieldErrors)[0];
          this.errorMessage.set(firstError as string);
        } else {
          this.errorMessage.set('Erro ao salvar paciente');
        }
      }
    });
  }
}