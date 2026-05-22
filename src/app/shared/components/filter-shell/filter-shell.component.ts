import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="filter-shell">
      <header class="filter-shell-header">
        <div>
          <h2>{{ title() }}</h2>
          <span *ngIf="subtitle()">{{ subtitle() }}</span>
        </div>
        <div class="filter-shell-actions">
          <button type="button" class="secondary" (click)="reset.emit()">
            <i class="pi pi-refresh"></i>
            Reset Filter
          </button>
          <button type="button" (click)="apply.emit()">
            <i class="pi pi-filter"></i>
            Set Filter
          </button>
        </div>
      </header>
      <div class="filter-shell-body">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .filter-shell {
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface);
        box-shadow: var(--app-shadow-soft);
        overflow: hidden;
      }

      .filter-shell-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.95rem;
        border-bottom: 1px solid var(--app-border);
      }

      h2 {
        margin: 0;
        color: var(--app-text);
        font-size: 1rem;
        font-weight: 800;
      }

      span {
        display: block;
        margin-top: 0.2rem;
        color: var(--app-muted);
        font-size: 0.78rem;
        font-weight: 700;
      }

      .filter-shell-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        min-height: 2.1rem;
        border: 1px solid var(--rdg-primary);
        border-radius: 8px;
        padding: 0 0.65rem;
        background: var(--app-primary-action);
        color: #ffffff;
        font-weight: 800;
        cursor: pointer;
      }

      button.secondary {
        border-color: var(--app-border);
        background: var(--app-surface-soft);
        color: var(--rdg-accent);
      }

      .filter-shell-body {
        padding: 0.95rem;
      }

      @media (max-width: 640px) {
        .filter-shell-header {
          align-items: stretch;
          flex-direction: column;
        }

        .filter-shell-actions button {
          flex: 1;
          justify-content: center;
        }
      }
    `
  ]
})
export class FilterShellComponent {
  title = input('Filters');
  subtitle = input('');
  apply = output<void>();
  reset = output<void>();
}
