import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient-service';
import { Patient } from '../../../core/models/patient.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './patient-list.html'
})
export class PatientList {

  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  patients = signal<Patient[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');

  // Signal para controlar o modal de confirmação de exclusão
  patientToDelete = signal<Patient | null>(null);

  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.patientService.findAll(this.searchTerm() || undefined).subscribe({
      next: (data) => {
        this.patients.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadPatients();
  }

  goToNew(): void {
    this.router.navigate(['/patients/new']);
  }

  goToEdit(patient: Patient): void {
    this.router.navigate(['/patients', patient.id, 'edit']);
  }

  confirmDelete(patient: Patient): void {
    this.patientToDelete.set(patient);
  }

  cancelDelete(): void {
    this.patientToDelete.set(null);
  }

  deletePatient(): void {
    const patient = this.patientToDelete();
    if (!patient) return;

    this.patientService.delete(patient.id).subscribe({
      next: () => {
        this.patientToDelete.set(null);
        this.loadPatients();
      },
      error: () => {
        this.patientToDelete.set(null);
      }
    });
  }
}