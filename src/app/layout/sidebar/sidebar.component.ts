import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandThemeService } from '../../core/services/brand-theme.service';

interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.expanded]="expanded">
      <div class="sidebar-brand" [attr.aria-label]="theme().brand.name">
        <img [src]="theme().logos.compact || theme().logos.main" [alt]="theme().brand.shortName" />
        <span class="brand-name">
          <strong>{{ theme().brand.shortName }}</strong>
          <small>{{ theme().brand.tagline }}</small>
        </span>
      </div>
      <a class="nav-link" [routerLink]="dashboardItem.route" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" [attr.title]="dashboardItem.label">
        <i [class]="dashboardItem.icon"></i>
        <span>{{ dashboardItem.label }}</span>
      </a>

      @for (section of visibleSections; track section.label) {
        <div class="menu-section">
          <span class="section-title">{{ section.label }}</span>
          @for (item of section.items; track item.route) {
            <a class="nav-link" [routerLink]="item.route" routerLinkActive="active" [attr.title]="item.label">
              <i [class]="item.icon"></i>
              <span>{{ item.label }}</span>
            </a>
          }
        </div>
      }
      <button type="button" class="sidebar-toggle" (click)="expanded = !expanded" [attr.aria-label]="expanded ? 'Collapse menu' : 'Expand menu'">
        <i class="pi" [class.pi-angle-double-right]="!expanded" [class.pi-angle-double-left]="expanded"></i>
      </button>
    </aside>
  `,
  styles: [
    `
      @font-face {
        font-family: 'ethnocentric rg';
        src: url('https://static.wfonts.com/data/2016/06/04/ethnocentric/ethnocentric rg.ttf') format('truetype');
        font-display: swap;
      }

      .sidebar {
        width: 74px;
        flex: 0 0 74px;
        height: 100vh;
        position: sticky;
        top: 0;
        background: var(--app-sidebar-bg, #ffffff);
        color: var(--app-text);
        padding: 0.7rem 0.75rem 0.7rem;
        border-right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.42rem;
        overflow-y: auto;
        overflow-x: visible;
        box-shadow: none;
        transition:
          width 180ms ease,
          flex-basis 180ms ease;
        scrollbar-width: none;
      }
      .sidebar::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
      .sidebar.expanded {
        width: 230px;
        flex-basis: 230px;
        align-items: stretch;
        padding-inline: 0.9rem;
      }
      .sidebar-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4.2rem;
        height: 4.2rem;
        min-height: 4.2rem;
        padding: 0;
        color: var(--app-text);
        font-size: 1.05rem;
        font-weight: 900;
        margin: 0 auto 0.45rem;
        overflow: visible;
      }
      .sidebar-brand img {
        width: 100%;
        height: 100%;
        max-width: 4.2rem;
        max-height: 4.2rem;
        object-fit: contain;
        object-position: center;
        display: block;
        flex: 0 0 auto;
      }
      .brand-name {
        display: none;
        gap: 0.12rem;
        line-height: 1;
      }
      .brand-name strong {
        color: var(--rdg-primary);
        font-family: var(--brand-font);
        font-size: 1.08rem;
        font-weight: 950;
      }
      .brand-name small {
        color: var(--rdg-accent);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        line-height: 1.15;
      }
      .sidebar.expanded .sidebar-brand {
        width: 100%;
        height: 5rem;
        min-height: 5rem;
        justify-content: center;
        margin-bottom: 0.25rem;
      }
      .sidebar.expanded .sidebar-brand img {
        width: 4.9rem;
        height: 4.9rem;
        max-width: 100%;
        max-height: 100%;
      }
      .sidebar-toggle {
        position: absolute;
        right: -0.72rem;
        bottom: 1.05rem;
        z-index: 5;
        display: grid;
        place-items: center;
        width: 1.85rem;
        height: 1.85rem;
        border: 1px solid var(--app-border);
        border-radius: 999px;
        color: var(--rdg-primary);
        background: var(--app-surface);
        cursor: pointer;
        align-self: center;
        margin-top: 0;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
      }
      .sidebar.expanded .sidebar-toggle {
        width: 1.85rem;
      }
      .menu-section {
        display: grid;
        gap: 0.28rem;
        margin-top: 0;
      }
      .section-title {
        display: none;
      }
      .sidebar.expanded .menu-section {
        gap: 0.16rem;
        margin-top: 0.34rem;
      }
      .sidebar.expanded .section-title {
        display: block;
        padding: 0.32rem 0.88rem 0.16rem;
        color: var(--app-muted);
        font-size: 0.64rem;
        font-weight: 900;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .nav-link {
        width: 3rem;
        height: 3rem;
        min-height: 3rem;
        color: var(--rdg-ink);
        text-decoration: none;
        padding: 0;
        border-radius: 14px;
        font-size: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        transition:
          background 160ms ease,
          color 160ms ease,
          transform 160ms ease;
      }
      .nav-link.active,
      .nav-link:hover {
        background: rgba(72, 125, 182, 0.14);
        color: var(--rdg-primary-strong);
        border-color: rgba(72, 125, 182, 0.3);
        transform: none;
      }
      i {
        margin-right: 0;
        color: currentColor;
        font-size: 1.32rem;
        font-weight: 300;
        text-shadow: 0 0 0 currentColor;
      }
      .nav-link span {
        display: none;
      }
      .sidebar.expanded .nav-link {
        width: 100%;
        height: 2.72rem;
        min-height: 2.72rem;
        justify-content: flex-start;
        gap: 0.72rem;
        padding: 0 0.95rem;
        font-size: 0.9rem;
      }
      .sidebar.expanded .nav-link span {
        display: inline;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (max-width: 900px) {
        .sidebar {
          width: 66px;
          flex-basis: 66px;
          padding: 0.7rem 0.45rem;
        }
        .sidebar.expanded {
          width: 210px;
          flex-basis: 210px;
          padding-inline: 0.75rem;
        }
        .nav-link {
          font-size: 0;
          justify-content: center;
          padding: 0.65rem 0.2rem;
        }
        i {
          margin-right: 0;
          font-size: 1.18rem;
        }
        .section-title {
          display: none;
        }
        .sidebar-brand {
          justify-content: center;
          width: 3.7rem;
          height: 3.7rem;
          min-height: 3.7rem;
          padding: 0;
        }
        .sidebar-brand img {
          width: 3.35rem;
          height: 3.35rem;
        }
        .sidebar.expanded .sidebar-brand {
          width: 100%;
          height: 4.85rem;
          min-height: 4.85rem;
        }
        .sidebar.expanded .sidebar-brand img {
          width: 4.75rem;
          height: 4.75rem;
        }
        .menu-section {
          margin-top: 0.2rem;
        }
      }
    `
  ]
})
export class SidebarComponent {
  private brandTheme = inject(BrandThemeService);
  theme = this.brandTheme.theme;
  expanded = true;
  dashboardItem = { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' };

  sections: SidebarSection[] = [
    {
      label: 'Member Management',
      items: [
        { label: 'Enquiries', route: '/enquiries', icon: 'pi pi-envelope', permission: 'Enquiries' },
        { label: 'Members', route: '/members', icon: 'pi pi-users', permission: 'Members' },
        { label: 'Plans', route: '/plans', icon: 'pi pi-id-card', permission: 'Plans' },
        { label: 'Payments', route: '/payments', icon: 'pi pi-wallet', permission: 'Payments' },
        { label: 'Attendance', route: '/attendance', icon: 'pi pi-check-square', permission: 'Attendance' }
      ]
    },
    {
      label: 'Operations',
      items: [
        { label: 'Staff', route: '/staff', icon: 'pi pi-briefcase', permission: 'Staff' },
        { label: 'Inventory', route: '/inventory', icon: 'pi pi-box', permission: 'Inventory' },
        { label: 'Offers', route: '/offers', icon: 'pi pi-ticket', permission: 'Offers' }
      ]
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Reports', route: '/reports', icon: 'pi pi-chart-line', permission: 'Reports' },
        { label: 'AI Insights', route: '/ai-insights', icon: 'pi pi-sparkles', permission: 'AI Insights' }
      ]
    },
    {
      label: 'System',
      items: [
        { label: 'Notifications', route: '/notifications', icon: 'pi pi-bell', permission: 'Notifications' },
        { label: 'Settings', route: '/settings', icon: 'pi pi-cog', permission: 'Settings' }
      ]
    },
  ];

  constructor(private auth: AuthService) { }

  get visibleSections(): SidebarSection[] {
    return this.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.permission || this.auth.canAccessPermission(item.permission))
      }))
      .filter((section) => section.items.length > 0);
  }
}
