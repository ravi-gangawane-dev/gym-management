import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="crumb" aria-label="Breadcrumb">
      <a routerLink="/dashboard" aria-label="Dashboard">
        <i class="pi pi-home"></i>
      </a>
      <i class="pi pi-angle-right"></i>
      <ng-container *ngFor="let item of items; let last = last">
        <a *ngIf="item.url && !last; else plainLabel" [routerLink]="item.url">{{ item.label }}</a>
        <ng-template #plainLabel>
          <span [class.current]="last">{{ item.label }}</span>
        </ng-template>
        <i *ngIf="!last" class="pi pi-angle-right"></i>
      </ng-container>
    </nav>
  `,
  styles: [
    `
      .crumb {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        min-height: 3rem;
        padding: 1rem 0;
        border-bottom: 0;
        background: transparent;
        color: #65748b;
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1;
      }

      .crumb a {
        display: inline-flex;
        align-items: center;
        color: var(--rdg-accent);
        text-decoration: none;
      }

      .crumb i {
        display: inline-flex;
        align-items: center;
        color: #718096;
        font-size: 0.9rem;
      }

      .crumb .current {
        color: #65748b;
      }
    `
  ]
})
export class BreadcrumbComponent {
  items: BreadcrumbItem[] = [{ label: 'Dashboard' }];

  private sectionLabels: Record<string, string> = {
    'ai-insights': 'AI Insights',
    attendance: 'Attendance',
    dashboard: 'Dashboard',
    enquiries: 'Enquiries',
    inventory: 'Inventory',
    members: 'Members',
    notifications: 'Notifications',
    offers: 'Offers',
    payments: 'Payments',
    plans: 'Plans',
    profile: 'Profile',
    reports: 'Reports',
    settings: 'Settings',
    staff: 'Staff',
    trainers: 'Staff'
  };

  private singularLabels: Record<string, string> = {
    enquiries: 'Enquiry',
    members: 'Member',
    plans: 'Plan',
    staff: 'Staff',
    trainers: 'Staff'
  };

  constructor(private router: Router) {
    this.update(router.url);
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.update((event as NavigationEnd).urlAfterRedirects);
    });
  }

  private update(url: string): void {
    const segments = url.split('?')[0].split('#')[0].split('/').filter(Boolean);
    const section = segments[0] || 'dashboard';
    const sectionLabel = this.sectionLabels[section] ?? this.toTitle(section);

    const items: BreadcrumbItem[] = [{ label: sectionLabel, url: section === 'dashboard' ? undefined : `/${section}` }];
    const action = segments[1];

    if (action === 'add') {
      items.push({ label: `Add ${this.entityLabel(section)}` });
    } else if (action === 'create') {
      items.push({ label: `Create ${this.entityLabel(section)}` });
    } else if (action === 'edit') {
      items.push({ label: `Edit ${this.entityLabel(section)}` });
    } else if (action) {
      items.push({ label: `${this.entityLabel(section)} Details` });
    }

    this.items = items;
  }

  private entityLabel(section: string): string {
    return this.singularLabels[section] ?? this.sectionLabels[section] ?? this.toTitle(section);
  }

  private toTitle(value: string): string {
    return value
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
