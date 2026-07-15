import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProcedureService } from '../../../core/services/procedure-service';
import { Procedure } from '../../../core/models/procedure.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './procedure-list.html'
})
export class ProcedureList {

  private readonly procedureService = inject(ProcedureService);
  private readonly router = inject(Router);

  procedures = signal<Procedure[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');

  procedureToDelete = signal<Procedure | null>(null);

  constructor() {
    this.loadProcedures();
  }

  loadProcedures(): void {
    this.isLoading.set(true);
    this.procedureService.findAll(this.searchTerm() || undefined).subscribe({
      next: (data) => {
        this.procedures.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    this.loadProcedures();
  }

  goToNew(): void {
    this.router.navigate(['/procedures/new']);
  }

  goToEdit(procedure: Procedure): void {
    this.router.navigate(['/procedures', procedure.id, 'edit']);
  }

  confirmDelete(procedure: Procedure): void {
    this.procedureToDelete.set(procedure);
  }

  cancelDelete(): void {
    this.procedureToDelete.set(null);
  }

  deleteProcedure(): void {
    const procedure = this.procedureToDelete();
    if (!procedure) return;

    this.procedureService.delete(procedure.id).subscribe({
      next: () => {
        this.procedureToDelete.set(null);
        this.loadProcedures();
      },
      error: () => this.procedureToDelete.set(null)
    });
  }
}