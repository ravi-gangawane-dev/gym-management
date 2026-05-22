import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'brand-theme',
    loadComponent: () =>
      import('./pages/brand-theme-management/brand-theme-management.component').then((m) => m.BrandThemeManagementComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-home/settings-home.component').then((m) => m.SettingsHomeComponent)
  }
];
