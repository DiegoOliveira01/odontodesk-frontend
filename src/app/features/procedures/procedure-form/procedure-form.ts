import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProcedureService } from '../../../core/services/procedure-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-procedure-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './procedure-form.html'
})
export class ProcedureForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly procedureService = inject(ProcedureService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  procedureId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  procedureForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    estimatedDurationMinutes: [null, Validators.min(1)],
    price: [null, Validators.min(0)]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.procedureId.set(Number(id));
      this.isEditMode.set(true);
      this.loadProcedure(Number(id));
    }
  }

  private loadProcedure(id: number): void {
    this.isLoading.set(true);
    this.procedureService.findById(id).subscribe({
      next: (procedure) => {
        this.procedureForm.patchValue({
          name: procedure.name,
          description: procedure.description,
          estimatedDurationMinutes: procedure.estimatedDurationMinutes,
          price: procedure.price
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Procedimento não encontrado');
      }
    });
  }

  onSubmit(): void {
    if (this.procedureForm.invalid) {
      this.procedureForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEditMode()
      ? this.procedureService.update(this.procedureId()!, this.procedureForm.value)
      : this.procedureService.create(this.procedureForm.value);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/procedures']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);

        if (err.status === 422) {
          this.errorMessage.set(err.error?.message ?? 'Erro de validação');
        } else if (err.status === 400 && err.error?.fieldErrors) {
          const firstError = Object.values(err.error.fieldErrors)[0];
          this.errorMessage.set(firstError as string);
        } else {
          this.errorMessage.set('Erro ao salvar procedimento');
        }
      }
    });
  }
}