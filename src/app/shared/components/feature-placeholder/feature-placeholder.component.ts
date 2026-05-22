import { Component, input } from '@angular/core';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  template: `
    <div class="page-card">
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
    </div>
  `
})
export class FeaturePlaceholderComponent {
  title = input.required<string>();
  description = input('Feature scaffold is ready for extension.');
}
