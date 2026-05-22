import { Routes } from '@angular/router';

export const TRAINERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/trainer-list/trainer-list.component').then((m) => m.TrainerListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/trainer-form/trainer-form.component').then((m) => m.TrainerFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/trainer-form/trainer-form.component').then((m) => m.TrainerFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/trainer-details/trainer-details.component').then((m) => m.TrainerDetailsComponent)
  }
];
