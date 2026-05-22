import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inventory-home/inventory-home.component').then((m) => m.InventoryHomeComponent)
  }
];
