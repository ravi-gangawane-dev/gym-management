import { Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    @if (visible()) {
      <div class="loader-wrapper">
        <p-progress-spinner strokeWidth="4" />
      </div>
    }
  `,
  styles: [
    `
      .loader-wrapper {
        display: flex;
        justify-content: center;
        padding: 1rem;
      }
    `
  ]
})
export class LoaderComponent {
  visible = input(false);
}
