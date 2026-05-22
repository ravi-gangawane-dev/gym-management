import { Routes } from '@angular/router';

export const ENQUIRIES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/enquiry-list/enquiry-list.component').then((m) => m.EnquiryListComponent)
    },
    {
        path: 'create',
        loadComponent: () =>
            import('./pages/create-enquiry/create-enquiry.component').then((m) => m.CreateEnquiryComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () =>
            import('./pages/edit-enquiry/edit-enquiry.component').then((m) => m.EditEnquiryComponent)
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/enquiry-details/enquiry-details.component').then((m) => m.EnquiryDetailsComponent)
    }
];
