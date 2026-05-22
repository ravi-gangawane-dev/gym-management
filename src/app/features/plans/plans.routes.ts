import { Routes } from '@angular/router';

export const PLANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/plans-home/plans-home.component').then((m) => m.PlansHomeComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./pages/plan-form/plan-form.component').then((m) => m.PlanFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/plan-form/plan-form.component').then((m) => m.PlanFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/plan-details/plan-details.component').then((m) => m.PlanDetailsComponent)
  }
];
