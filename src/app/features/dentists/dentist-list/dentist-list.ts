import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DentistService } from '../../../core/services/dentist-service';
import { Dentist } from '../../../core/models/dentist.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dentist-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './dentist-list.html'
})
export class DentistList {

  private readonly dentistService = inject(DentistService);
  private readonly router = inject(Router);

  dentists = signal<Dentist[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  specialtyFilter = signal<string>('');

  dentistToDelete = signal<Dentist | null>(null);

  constructor() {
    this.loadDentists();
  }

  loadDentists(): void {
    this.isLoading.set(true);
    this.dentistService
      .findAll(this.searchTerm() || undefined, this.specialtyFilter() || undefined)
      .subscribe({
        next: (data) => {
          this.dentists.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  onSearch(): void {
    this.loadDentists();
  }

  goToNew(): void {
    this.router.navigate(['/dentists/new']);
  }

  goToEdit(dentist: Dentist): void {
    this.router.navigate(['/dentists', dentist.id, 'edit']);
  }

  confirmDelete(dentist: Dentist): void {
    this.dentistToDelete.set(dentist);
  }

  cancelDelete(): void {
    this.dentistToDelete.set(null);
  }

  deleteDentist(): void {
    const dentist = this.dentistToDelete();
    if (!dentist) return;

    this.dentistService.delete(dentist.id).subscribe({
      next: () => {
        this.dentistToDelete.set(null);
        this.loadDentists();
      },
      error: () => this.dentistToDelete.set(null)
    });
  }
}