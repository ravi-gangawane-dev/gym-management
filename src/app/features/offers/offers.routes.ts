import { Routes } from '@angular/router';

export const OFFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/offers-home/offers-home.component').then((m) => m.OffersHomeComponent)
  }
];
