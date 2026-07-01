import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DentistService } from '../../../core/services/dentist-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dentist-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './dentist-form.html'
})
export class DentistForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly dentistService = inject(DentistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  dentistId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  dentistForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    cro: ['', Validators.required],
    specialty: [''],
    phone: [''],
    email: ['', Validators.email]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.dentistId.set(Number(id));
      this.isEditMode.set(true);
      this.loadDentist(Number(id));
    }
  }

  private loadDentist(id: number): void {
    this.isLoading.set(true);
    this.dentistService.findById(id).subscribe({
      next: (dentist) => {
        this.dentistForm.patchValue({
          name: dentist.name,
          cro: dentist.cro,
          specialty: dentist.specialty,
          phone: dentist.phone,
          email: dentist.email
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Dentista não encontrado');
      }
    });
  }

  onSubmit(): void {
    if (this.dentistForm.invalid) {
      this.dentistForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEditMode()
      ? this.dentistService.update(this.dentistId()!, this.dentistForm.value)
      : this.dentistService.create(this.dentistForm.value);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/dentists']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (err.status === 422) {
          this.errorMessage.set(err.error?.message ?? 'Erro de validação');
        } else if (err.status === 400 && err.error?.fieldErrors) {
          const firstError = Object.values(err.error.fieldErrors)[0];
          this.errorMessage.set(firstError as string);
        } else {
          this.errorMessage.set('Erro ao salvar dentista');
        }
      }
    });
  }
}