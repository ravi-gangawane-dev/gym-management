import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-profile-image-viewer',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [header]="title()"
      [modal]="true"
      [visible]="visible()"
      (visibleChange)="visibleChange.emit($event)"
      [dismissableMask]="true"
      [style]="{ width: 'min(94vw, 760px)' }"
      [contentStyle]="{ padding: '0.75rem' }">
      <img *ngIf="src()" class="preview-image" [src]="src()" [alt]="alt()" />
    </p-dialog>
  `,
  styles: [
    `
      .preview-image {
        display: block;
        width: 100%;
        max-height: 78vh;
        object-fit: contain;
        border-radius: 8px;
        background: #0f172a;
      }
    `
  ]
})
export class ProfileImageViewerComponent {
  title = input('Image Preview');
  src = input('');
  alt = input('');
  visible = input(false);
  visibleChange = output<boolean>();
}
