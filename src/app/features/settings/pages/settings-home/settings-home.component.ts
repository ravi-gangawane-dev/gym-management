import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrandThemeManagementComponent } from '../brand-theme-management/brand-theme-management.component';

type SettingsKey =
  | 'general'
  | 'staff'
  | 'membership'
  | 'payments'
  | 'attendance'
  | 'notifications'
  | 'ai'
  | 'integrations'
  | 'security'
  | 'branding'
  | 'advanced';

interface SettingsNavItem {
  key: SettingsKey;
  label: string;
  icon: string;
  description: string;
}

interface ToggleOption {
  key: keyof SettingsHomeComponent['toggles'];
  label: string;
  note: string;
}

@Component({
  selector: 'app-settings-home',
  standalone: true,
  imports: [CommonModule, FormsModule, BrandThemeManagementComponent],
  template: `
    <div class="settings-page">
      <section class="settings-hero">
        <div>
          <span class="eyebrow">System Settings</span>
          <h2>Settings</h2>
          <p>Control gym profile, roles, memberships, payments, attendance, notifications, AI, integrations, security, branding, and system preferences.</p>
        </div>
        <div class="save-state">
          <i class="pi pi-check-circle"></i>
          Auto saved
        </div>
      </section>

      <section class="settings-search page-card">
        <i class="pi pi-search"></i>
        <input type="search" placeholder="Search settings..." [(ngModel)]="searchTerm" />
      </section>

      <section class="settings-layout">
        <aside class="settings-nav page-card">
          <button
            type="button"
            *ngFor="let item of filteredNav"
            [class.active]="activeKey === item.key"
            (click)="selectSection(item.key)"
          >
            <i [class]="item.icon"></i>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
          </button>
        </aside>

        <main class="settings-panel page-card" [ngSwitch]="activeKey">
          <ng-container *ngSwitchCase="'general'">
            <div class="panel-heading">
              <h3>Gym Profile</h3>
              <p>Basic business information and public identity.</p>
            </div>
            <div class="form-grid">
              <label>Gym Name <input [(ngModel)]="profile.gymName" /></label>
              <label>Phone Number <input [(ngModel)]="profile.phone" /></label>
              <label>Email <input [(ngModel)]="profile.email" /></label>
              <label>GST Number <input [(ngModel)]="profile.gst" /></label>
              <label>Website <input [(ngModel)]="profile.website" /></label>
              <label>Business Hours <input [(ngModel)]="profile.hours" /></label>
              <label class="full">Address <textarea rows="3" [(ngModel)]="profile.address"></textarea></label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'staff'">
            <div class="panel-heading">
              <h3>Staff & Permissions</h3>
              <p>Role-based access for admin, manager, receptionist, trainer, and accountant.</p>
            </div>
            <div class="role-grid">
              <article *ngFor="let role of roles">
                <h4>{{ role.name }}</h4>
                <p>{{ role.description }}</p>
                <div class="permission-tags">
                  <span *ngFor="let permission of role.permissions">{{ permission }}</span>
                </div>
              </article>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'membership'">
            <div class="panel-heading">
              <h3>Membership Settings</h3>
              <p>Plan behavior, grace rules, freezes, upgrades, and trials.</p>
            </div>
            <div class="form-grid">
              <label>Default Duration <select [(ngModel)]="membership.defaultDuration"><option>1 Month</option><option>3 Months</option><option>6 Months</option><option>12 Months</option></select></label>
              <label>Grace Period <input type="number" [(ngModel)]="membership.gracePeriod" /></label>
              <label>Freeze Limit <input type="number" [(ngModel)]="membership.freezeDays" /></label>
              <label>Trial Membership <select [(ngModel)]="membership.trial"><option>3 Days</option><option>7 Days</option><option>14 Days</option></select></label>
            </div>
            <div class="toggle-list">
              <label class="toggle-row" *ngFor="let option of membershipToggles">
                <span><strong>{{ option.label }}</strong><small>{{ option.note }}</small></span>
                <input type="checkbox" [(ngModel)]="toggles[option.key]" />
              </label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'payments'">
            <div class="panel-heading">
              <h3>Payment Settings</h3>
              <p>Invoices, taxes, refunds, late fees, auto billing, and gateways.</p>
            </div>
            <div class="form-grid">
              <label>Currency <select [(ngModel)]="payments.currency"><option>INR</option><option>USD</option></select></label>
              <label>GST Rate (%) <input type="number" [(ngModel)]="payments.gstRate" /></label>
              <label>Invoice Prefix <input [(ngModel)]="payments.invoicePrefix" /></label>
              <label>Late Fee <input type="number" [(ngModel)]="payments.lateFee" /></label>
              <label>Refund Window <input [(ngModel)]="payments.refundWindow" /></label>
              <label>Primary Gateway <select [(ngModel)]="payments.gateway"><option>Razorpay</option><option>Stripe</option><option>PayPal</option><option>PhonePe</option><option>Google Pay</option></select></label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'attendance'">
            <div class="panel-heading">
              <h3>Attendance Settings</h3>
              <p>Check-in methods, duplicate prevention, late rules, and absence automation.</p>
            </div>
            <div class="toggle-list">
              <label class="toggle-row" *ngFor="let option of attendanceToggles">
                <span><strong>{{ option.label }}</strong><small>{{ option.note }}</small></span>
                <input type="checkbox" [(ngModel)]="toggles[option.key]" />
              </label>
            </div>
            <div class="form-grid compact">
              <label>Auto Mark Absent After Days <input type="number" [(ngModel)]="attendance.absentAfterDays" /></label>
              <label>Late Entry Time <input [(ngModel)]="attendance.lateEntryTime" /></label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'notifications'">
            <div class="panel-heading">
              <h3>Notification Settings</h3>
              <p>Communication channels and automated member alerts.</p>
            </div>
            <div class="toggle-list">
              <label class="toggle-row" *ngFor="let option of notificationToggles">
                <span><strong>{{ option.label }}</strong><small>{{ option.note }}</small></span>
                <input type="checkbox" [(ngModel)]="toggles[option.key]" />
              </label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'ai'">
            <div class="panel-heading">
              <h3>AI & Automation</h3>
              <p>Premium prediction controls for churn, offers, revenue, and automation.</p>
            </div>
            <div class="toggle-list">
              <label class="toggle-row" *ngFor="let option of aiToggles">
                <span><strong>{{ option.label }}</strong><small>{{ option.note }}</small></span>
                <input type="checkbox" [(ngModel)]="toggles[option.key]" />
              </label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'integrations'">
            <div class="panel-heading">
              <h3>Integrations</h3>
              <p>Connect biometric devices, WhatsApp API, email services, calendars, and fitness devices.</p>
            </div>
            <div class="integration-grid">
              <article *ngFor="let integration of integrations">
                <i [class]="integration.icon"></i>
                <div><strong>{{ integration.name }}</strong><span>{{ integration.status }}</span></div>
              </article>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'security'">
            <div class="panel-heading">
              <h3>Security</h3>
              <p>Protect accounts, sessions, devices, and dangerous settings.</p>
            </div>
            <div class="toggle-list">
              <label class="toggle-row" *ngFor="let option of securityToggles">
                <span><strong>{{ option.label }}</strong><small>{{ option.note }}</small></span>
                <input type="checkbox" [(ngModel)]="toggles[option.key]" />
              </label>
            </div>
            <div class="form-grid compact">
              <label>Session Timeout <select [(ngModel)]="security.sessionTimeout"><option>15 minutes</option><option>30 minutes</option><option>60 minutes</option></select></label>
              <label>Password Policy <select [(ngModel)]="security.passwordPolicy"><option>Standard</option><option>Strong</option><option>Enterprise</option></select></label>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'branding'">
            <app-brand-theme-management></app-brand-theme-management>
          </ng-container>

          <ng-container *ngSwitchCase="'advanced'">
            <div class="panel-heading">
              <h3>Advanced Preferences</h3>
              <p>Timezone, language, dashboard layout, audit logs, and admin locks.</p>
            </div>
            <div class="form-grid compact">
              <label>Timezone <select [(ngModel)]="advanced.timezone"><option>Asia/Calcutta</option><option>UTC</option></select></label>
              <label>Language <select [(ngModel)]="advanced.language"><option>English</option><option>Hindi</option></select></label>
              <label>Date Format <select [(ngModel)]="advanced.dateFormat"><option>DD-MM-YYYY</option><option>MM-DD-YYYY</option><option>YYYY-MM-DD</option></select></label>
              <label>Dashboard Layout <select [(ngModel)]="advanced.dashboardLayout"><option>Compact</option><option>Detailed</option></select></label>
            </div>
            <div class="audit-log">
              <h4>Audit Logs</h4>
              <div *ngFor="let log of auditLogs"><span>{{ log.user }}</span><small>{{ log.action }} | {{ log.time }}</small></div>
            </div>
          </ng-container>
        </main>
      </section>
    </div>
  `,
  styles: [
    `
      .settings-page {
        display: grid;
        gap: 1rem;
      }

      .settings-hero {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: var(--app-radius);
        color: #fff;
        background: var(--app-hero);
      }

      h2,
      h3,
      h4,
      p {
        margin: 0;
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .settings-hero p {
        color: rgba(255, 255, 255, 0.86);
      }

      .save-state {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 999px;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.14);
        font-weight: 800;
        white-space: nowrap;
      }

      .settings-search {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.75rem 1rem;
      }

      .settings-search i {
        color: var(--rdg-accent);
      }

      .settings-search input {
        width: 100%;
        border: 0;
        outline: 0;
        color: var(--app-text);
        background: transparent;
      }

      .settings-layout {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 1rem;
        align-items: start;
      }

      .settings-nav {
        display: grid;
        gap: 0.35rem;
        padding: 0.65rem;
      }

      .settings-nav button {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 0.65rem;
        align-items: center;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 0.65rem;
        color: var(--app-text);
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .settings-nav button.active,
      .settings-nav button:hover {
        border-color: #c9e4f3;
        background: var(--rdg-accent-soft);
        color: var(--rdg-accent);
      }

      .settings-nav i {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: #eaf4fb;
        color: var(--rdg-accent);
      }

      .settings-nav small,
      .panel-heading p,
      label,
      .role-grid p,
      .integration-grid span,
      .toggle-row small,
      .audit-log small {
        color: var(--app-muted);
      }

      .settings-nav strong,
      .settings-nav small,
      .toggle-row small {
        display: block;
      }

      .settings-panel {
        min-height: 620px;
      }

      .panel-heading {
        display: grid;
        gap: 0.25rem;
        margin-bottom: 1rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .form-grid.compact {
        margin-top: 1rem;
      }

      .full {
        grid-column: 1 / -1;
      }

      label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.84rem;
        font-weight: 800;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid #d2dce8;
        border-radius: 8px;
        padding: 0.68rem 0.75rem;
        color: var(--app-text);
        background: #fff;
      }

      .toggle-list,
      .role-grid,
      .integration-grid,
      .audit-log {
        display: grid;
        gap: 0.75rem;
      }

      .toggle-row,
      .role-grid article,
      .integration-grid article,
      .audit-log div {
        border: 1px solid var(--app-border);
        border-radius: 8px;
        padding: 0.75rem;
        background: #fff;
      }

      .toggle-row {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }

      .toggle-row input {
        width: 44px;
        height: 24px;
        accent-color: var(--rdg-accent);
      }

      .role-grid {
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      }

      .permission-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.65rem;
      }

      .permission-tags span,
      .status-chip {
        border-radius: 999px;
        padding: 0.25rem 0.55rem;
        background: #eaf4fb;
        color: var(--rdg-accent);
        font-size: 0.76rem;
        font-weight: 800;
      }

      .integration-grid article {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
      }

      .integration-grid {
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      }

      .integration-grid article {
        justify-content: flex-start;
      }

      .integration-grid i {
        color: var(--rdg-primary);
      }

      .audit-log {
        margin-top: 1rem;
      }

      .audit-log span {
        display: block;
        font-weight: 800;
      }

      @media (max-width: 980px) {
        .settings-hero,
        .settings-layout,
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SettingsHomeComponent {
  constructor(private router: Router) {}

  activeKey: SettingsKey = 'general';
  searchTerm = '';

  navItems: SettingsNavItem[] = [
    { key: 'general', label: 'General', icon: 'pi pi-building', description: 'Gym profile' },
    { key: 'staff', label: 'Staff & Permissions', icon: 'pi pi-briefcase', description: 'Roles and access' },
    { key: 'membership', label: 'Membership', icon: 'pi pi-id-card', description: 'Plan rules' },
    { key: 'payments', label: 'Payments', icon: 'pi pi-wallet', description: 'Billing and gateways' },
    { key: 'attendance', label: 'Attendance', icon: 'pi pi-check-square', description: 'Check-in logic' },
    { key: 'notifications', label: 'Notifications', icon: 'pi pi-bell', description: 'Alerts and channels' },
    { key: 'ai', label: 'AI Automation', icon: 'pi pi-sparkles', description: 'Premium controls' },
    { key: 'integrations', label: 'Integrations', icon: 'pi pi-link', description: 'External services' },
    { key: 'security', label: 'Security', icon: 'pi pi-lock', description: 'Login and devices' },
    { key: 'branding', label: 'Brand Theme', icon: 'pi pi-palette', description: 'Theme and logo' },
    { key: 'advanced', label: 'Advanced', icon: 'pi pi-cog', description: 'System preferences' }
  ];

  profile = {
    gymName: 'RDG Gym',
    phone: '9876543210',
    email: 'admin@rdggym.com',
    gst: '27ABCDE1234F1Z5',
    website: 'https://rdggym.example',
    hours: '5:00 AM - 11:00 PM',
    address: 'Main Road, Pune'
  };

  membership = { defaultDuration: '3 Months', gracePeriod: 7, freezeDays: 15, trial: '7 Days' };
  payments = { currency: 'INR', gstRate: 18, invoicePrefix: 'RDG-INV', lateFee: 250, refundWindow: '7 Days', gateway: 'Razorpay' };
  attendance = { absentAfterDays: 5, lateEntryTime: '10:30 PM' };
  security = { sessionTimeout: '30 minutes', passwordPolicy: 'Strong' };
  branding = { appName: 'RDG Admin', mode: 'Light Mode', primaryColor: '#487DB6', accentColor: '#DC7B2A' };
  advanced = { timezone: 'Asia/Calcutta', language: 'English', dateFormat: 'DD-MM-YYYY', dashboardLayout: 'Compact' };

  toggles = {
    freezeMembership: true,
    autoRenewal: true,
    planUpgradeRules: true,
    qrAttendance: true,
    faceRecognition: false,
    gpsAttendance: false,
    duplicateCheckins: true,
    whatsAppAlerts: true,
    smsAlerts: true,
    emailAlerts: true,
    pushAlerts: false,
    expiryReminders: true,
    birthdayWishes: true,
    paymentReminders: true,
    offerCampaigns: true,
    aiInsights: true,
    churnPrediction: true,
    smartOffers: true,
    revenueForecasting: true,
    twoFactor: true,
    adminLock: true,
    deviceAccess: true
  };

  membershipToggles: ToggleOption[] = [
    { key: 'freezeMembership', label: 'Freeze Membership', note: 'Allow temporary pause for valid memberships.' },
    { key: 'autoRenewal', label: 'Auto Renewal', note: 'Renew plans automatically when billing is enabled.' },
    { key: 'planUpgradeRules', label: 'Plan Upgrade Rules', note: 'Allow upgrade with adjusted remaining value.' }
  ];

  attendanceToggles: ToggleOption[] = [
    { key: 'qrAttendance', label: 'QR Attendance', note: 'Enable fast QR code check-ins.' },
    { key: 'faceRecognition', label: 'Face Recognition', note: 'Future-ready AI face check-in.' },
    { key: 'gpsAttendance', label: 'GPS Attendance', note: 'Validate mobile attendance location.' },
    { key: 'duplicateCheckins', label: 'Duplicate Check-ins', note: 'Prevent repeated entries in one session.' }
  ];

  notificationToggles: ToggleOption[] = [
    { key: 'whatsAppAlerts', label: 'WhatsApp Alerts', note: 'Use WhatsApp for reminders and campaigns.' },
    { key: 'smsAlerts', label: 'SMS Alerts', note: 'Send critical alerts over SMS.' },
    { key: 'emailAlerts', label: 'Email Alerts', note: 'Send invoices and reports through email.' },
    { key: 'pushAlerts', label: 'Push Notifications', note: 'Mobile app notifications for members.' },
    { key: 'expiryReminders', label: 'Membership Expiry Reminders', note: 'Notify before membership expiry.' },
    { key: 'birthdayWishes', label: 'Birthday Wishes', note: 'Send automated member birthday messages.' },
    { key: 'paymentReminders', label: 'Payment Reminders', note: 'Follow up for pending dues.' },
    { key: 'offerCampaigns', label: 'Offer Campaigns', note: 'Enable automated offer broadcasts.' }
  ];

  aiToggles: ToggleOption[] = [
    { key: 'aiInsights', label: 'Enable AI Insights', note: 'Show premium AI prediction dashboards.' },
    { key: 'churnPrediction', label: 'Member Churn Prediction', note: 'Detect members at risk of leaving.' },
    { key: 'smartOffers', label: 'Smart Offers', note: 'Recommend retention offers automatically.' },
    { key: 'revenueForecasting', label: 'Revenue Forecasting', note: 'Predict future monthly revenue.' }
  ];

  securityToggles: ToggleOption[] = [
    { key: 'twoFactor', label: '2FA Login', note: 'Require second factor for staff login.' },
    { key: 'adminLock', label: 'Advanced Settings Lock', note: 'Require admin password for dangerous changes.' },
    { key: 'deviceAccess', label: 'Device Access Control', note: 'Track and restrict trusted devices.' }
  ];

  roles = [
    { name: 'Admin', description: 'Full system access.', permissions: ['All Modules', 'Settings', 'Security'] },
    { name: 'Manager', description: 'Operations and reports.', permissions: ['Reports', 'Staff', 'Members'] },
    { name: 'Receptionist', description: 'Front desk workflows.', permissions: ['Enquiries', 'Payments', 'Attendance'] },
    { name: 'Trainer', description: 'Assigned members only.', permissions: ['Attendance', 'Member Notes'] },
    { name: 'Accountant', description: 'Billing and finance.', permissions: ['Payments', 'Invoices', 'Reports'] }
  ];

  integrations = [
    { name: 'Biometric Devices', status: 'Ready to connect', icon: 'pi pi-fingerprint' },
    { name: 'WhatsApp API', status: 'Connected', icon: 'pi pi-whatsapp' },
    { name: 'Email Services', status: 'Connected', icon: 'pi pi-envelope' },
    { name: 'Google Calendar', status: 'Not connected', icon: 'pi pi-calendar' },
    { name: 'Fitness Devices', status: 'Beta', icon: 'pi pi-heart' }
  ];

  auditLogs = [
    { user: 'Admin', action: 'Updated payment gateway', time: 'Today, 10:24 AM' },
    { user: 'Manager', action: 'Changed attendance duplicate rule', time: 'Yesterday, 6:40 PM' },
    { user: 'Admin', action: 'Enabled AI churn prediction', time: '14 May, 3:15 PM' }
  ];

  get filteredNav(): SettingsNavItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.navItems;
    }

    return this.navItems.filter((item) =>
      [item.label, item.description].join(' ').toLowerCase().includes(term)
    );
  }

  selectSection(key: SettingsKey): void {
    this.activeKey = key;
    if (key === 'branding') {
      this.router.navigateByUrl('/settings/brand-theme');
    }
  }
}
