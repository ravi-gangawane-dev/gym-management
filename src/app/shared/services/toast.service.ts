import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private message: MessageService) {}

  success(summary: string, detail: string): void {
    this.message.add({ severity: 'success', summary, detail });
  }

  error(summary: string, detail: string): void {
    this.message.add({ severity: 'error', summary, detail });
  }
}
