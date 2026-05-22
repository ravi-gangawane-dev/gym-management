import { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/member-list/member-list.component').then((m) => m.MemberListComponent)
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./pages/member-form/member-form.component').then((m) => m.MemberFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/member-form/member-form.component').then((m) => m.MemberFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/member-details/member-details.component').then((m) => m.MemberDetailsComponent)
  }
];
