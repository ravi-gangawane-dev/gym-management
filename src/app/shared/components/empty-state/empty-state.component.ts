import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <i [class]="icon()"></i>
      <strong>{{ title() }}</strong>
      <span>{{ message() }}</span>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: grid;
        place-items: center;
        gap: 0.45rem;
        min-height: 12rem;
        padding: 2rem;
        color: var(--app-muted);
        text-align: center;
      }

      i {
        display: grid;
        place-items: center;
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        background: #eaf4fb;
        color: var(--rdg-accent);
        font-size: 1.35rem;
      }

      strong {
        color: var(--app-text);
        font-size: 1rem;
      }

      span {
        max-width: 28rem;
        font-size: 0.9rem;
      }
    `
  ]
})
export class EmptyStateComponent {
  icon = input('pi pi-inbox');
  title = input('No records found');
  message = input('Try adjusting filters or adding a new record.');
}
