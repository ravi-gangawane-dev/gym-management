import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [DialogModule],
  template: `
    <p-dialog [header]="header()" [modal]="true" [visible]="visible()" (visibleChange)="closed.emit()">
      <ng-content />
    </p-dialog>
  `
})
export class ModalComponent {
  header = input('Dialog');
  visible = input(false);
  closed = output<void>();
}
