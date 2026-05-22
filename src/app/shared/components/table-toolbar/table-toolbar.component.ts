import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-table-toolbar">
      <div class="toolbar-title">
        <h3>{{ title() }}</h3>
        <span *ngIf="subtitle()">{{ subtitle() }}</span>
      </div>
      <div class="toolbar-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .app-table-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .toolbar-title {
        flex: 0 0 auto;
        min-width: max-content;
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        white-space: nowrap;
      }

      span {
        display: block;
        margin-top: 0.15rem;
        color: var(--app-muted);
        font-size: 0.82rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: 0.65rem;
        min-width: 0;
      }

      @media (max-width: 640px) {
        .app-table-toolbar,
        .toolbar-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .toolbar-title {
          min-width: 0;
        }

        .toolbar-actions {
          flex-wrap: wrap;
        }
      }
    `
  ]
})
export class TableToolbarComponent {
  title = input('');
  subtitle = input('');
}
