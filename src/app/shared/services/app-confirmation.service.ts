import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

interface ConfirmOptions {
  name?: string;
  message?: string;
  accept: () => void;
}

@Injectable({ providedIn: 'root' })
export class AppConfirmationService {
  private confirmationService = inject(ConfirmationService);

  archive({ message, accept }: ConfirmOptions): void {
    this.confirmationService.confirm({
      message: message ?? 'Archive this entry? It will be hidden from the active list.',
      header: 'Confirm Archive',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Archive',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'rdg-confirm-archive',
      rejectButtonStyleClass: 'rdg-confirm-cancel',
      accept
    });
  }

  permanentDelete({ name = 'this entry', message, accept }: ConfirmOptions): void {
    this.confirmationService.confirm({
      message:
        message ??
        `Permanently delete ${name}? This is useful for dummy, duplicate, or testing entries and cannot be undone.`,
      header: 'Delete Permanently',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete Permanently',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'rdg-confirm-delete',
      rejectButtonStyleClass: 'rdg-confirm-cancel',
      accept
    });
  }
}
