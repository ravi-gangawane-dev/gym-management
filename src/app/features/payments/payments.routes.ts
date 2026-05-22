import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    data: { mode: 'history' },
    loadComponent: () =>
      import('./pages/payments-home/payments-home.component').then((m) => m.PaymentsHomeComponent)
  },
  {
    path: 'add',
    data: { mode: 'checkout' },
    loadComponent: () =>
      import('./pages/payments-home/payments-home.component').then((m) => m.PaymentsHomeComponent)
  }
];
