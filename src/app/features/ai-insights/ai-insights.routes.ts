import { Routes } from '@angular/router';

export const AI_INSIGHTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/ai-insights-home/ai-insights-home.component').then((m) => m.AiInsightsHomeComponent)
  }
];
