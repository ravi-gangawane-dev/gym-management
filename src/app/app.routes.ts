import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { layoutGuard } from './core/guards/layout.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [layoutGuard],
    loadComponent: () =>
      import('./layout/pages/layout-shell/layout-shell.component').then((m) => m.LayoutShellComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'members',
        loadChildren: () => import('./features/members/members.routes').then((m) => m.MEMBERS_ROUTES)
      },
      {
        path: 'staff',
        loadChildren: () => import('./features/trainers/trainers.routes').then((m) => m.TRAINERS_ROUTES)
      },
      {
        path: 'trainers',
        loadChildren: () => import('./features/trainers/trainers.routes').then((m) => m.TRAINERS_ROUTES)
      },
      {
        path: 'plans',
        loadChildren: () => import('./features/plans/plans.routes').then((m) => m.PLANS_ROUTES)
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES)
      },
      {
        path: 'enquiries',
        loadChildren: () => import('./features/enquiries/enquiries.routes').then((m) => m.ENQUIRIES_ROUTES)
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./features/attendance/attendance.routes').then((m) => m.ATTENDANCE_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES)
      },
      {
        path: 'offers',
        loadChildren: () => import('./features/offers/offers.routes').then((m) => m.OFFERS_ROUTES)
      },
      {
        path: 'ai-insights',
        loadChildren: () =>
          import('./features/ai-insights/ai-insights.routes').then((m) => m.AI_INSIGHTS_ROUTES)
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-home/profile-home.component').then((m) => m.ProfileHomeComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
