import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isDemoDataEmptyMode } from '../../../../core/services/demo-data-reset.service';

interface NotificationMetric {
  label: string;
  value: string | number;
  note: string;
  icon: string;
}

interface Campaign {
  title: string;
  audience: string;
  channel: string;
  status: string;
  scheduledAt: string;
}

@Component({
  selector: 'app-notifications-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notifications-page">
      <section class="notifications-hero">
        <div>
          <span class="eyebrow">Notifications Center</span>
          <h2>Member Communication Automation</h2>
          <p>Send renewal reminders, birthday wishes, offer campaigns, and WhatsApp alerts from one place.</p>
        </div>
        <button type="button"><i class="pi pi-plus"></i> New Campaign</button>
      </section>

      <section class="metric-grid">
        <article class="metric-card" *ngFor="let metric of metrics">
          <i [class]="metric.icon"></i>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </section>

      <section class="automation-grid">
        <article class="page-card automation-card" *ngFor="let item of automationCards">
          <div class="card-icon"><i [class]="item.icon"></i></div>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.copy }}</p>
          </div>
          <label class="switch">
            <input type="checkbox" [(ngModel)]="item.enabled" />
            <span></span>
          </label>
        </article>
      </section>

      <section class="content-grid">
        <div class="page-card composer">
          <div class="section-heading">
            <div>
              <h3>Quick Message</h3>
              <p>Create an SMS, email, app, or WhatsApp broadcast.</p>
            </div>
            <span>WhatsApp Ready</span>
          </div>

          <div class="form-grid">
            <label>
              Audience
              <select [(ngModel)]="audience">
                <option>Membership Expiring Soon</option>
                <option>Inactive Members</option>
                <option>Birthday Members</option>
                <option>All Active Members</option>
                <option>Trial Leads</option>
              </select>
            </label>
            <label>
              Channel
              <select [(ngModel)]="channel">
                <option>WhatsApp</option>
                <option>SMS</option>
                <option>Email</option>
                <option>App Push</option>
              </select>
            </label>
          </div>

          <label>
            Message Template
            <textarea [(ngModel)]="message" rows="6"></textarea>
          </label>

          <div class="composer-actions">
            <button type="button"><i class="pi pi-send"></i> Send Now</button>
            <button type="button" class="secondary"><i class="pi pi-calendar"></i> Schedule</button>
          </div>
        </div>

        <aside class="page-card template-panel">
          <h3>Templates</h3>
          <button type="button" *ngFor="let template of templates" (click)="message = template.copy">
            <i [class]="template.icon"></i>
            <span>{{ template.title }}</span>
          </button>
        </aside>
      </section>

      <section class="page-card campaign-table">
        <div class="section-heading">
          <div>
            <h3>Scheduled Campaigns</h3>
            <p>Track upcoming reminders, wishes, offers, and automated WhatsApp flows.</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Audience</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let campaign of campaigns">
                <td>{{ campaign.title }}</td>
                <td>{{ campaign.audience }}</td>
                <td>{{ campaign.channel }}</td>
                <td><span class="status-pill">{{ campaign.status }}</span></td>
                <td>{{ campaign.scheduledAt }}</td>
              </tr>
              <tr *ngIf="!campaigns.length">
                <td colspan="5">No campaigns scheduled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .notifications-page {
        display: grid;
        gap: 1rem;
      }

      .notifications-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.35rem;
        border-radius: 12px;
        color: #fff;
        background: var(--app-hero);
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      .notifications-hero p {
        color: rgba(255, 255, 255, 0.88);
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.68rem 0.85rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      button.secondary {
        background: var(--app-secondary-action);
      }

      button i {
        margin-right: 0.35rem;
      }

      .metric-grid,
      .automation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 0.85rem;
      }

      .metric-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .metric-card i,
      .card-icon {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: #eaf4fb;
        color: #0d78b1;
      }

      .metric-card span,
      .section-heading p,
      .automation-card p,
      small {
        color: #64748b;
      }

      .metric-card span {
        display: block;
        margin-top: 0.7rem;
        font-size: 0.84rem;
        font-weight: 800;
      }

      .metric-card strong {
        display: block;
        margin: 0.25rem 0;
        font-size: 1.7rem;
        color: #0d78b1;
      }

      .automation-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: center;
      }

      .switch input {
        display: none;
      }

      .switch span {
        width: 46px;
        height: 26px;
        border-radius: 999px;
        background: #cbd5e1;
        display: block;
        position: relative;
      }

      .switch span::after {
        content: '';
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: 0.2s ease;
      }

      .switch input:checked + span {
        background: #16a34a;
      }

      .switch input:checked + span::after {
        left: 23px;
      }

      .content-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
        gap: 1rem;
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .section-heading span {
        align-self: flex-start;
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        padding: 0.3rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: #475569;
        font-size: 0.82rem;
        font-weight: 800;
      }

      select,
      textarea {
        width: 100%;
        border: 1px solid #d2dce8;
        border-radius: 8px;
        padding: 0.7rem 0.75rem;
        font: inherit;
      }

      textarea {
        margin-top: 0.85rem;
        resize: vertical;
      }

      .composer-actions {
        display: flex;
        gap: 0.6rem;
        margin-top: 0.9rem;
      }

      .template-panel {
        display: grid;
        gap: 0.65rem;
        align-content: start;
      }

      .template-panel button {
        background: #f8fafc;
        color: #1f2937;
        border: 1px solid #dde5ee;
        text-align: left;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 680px;
        border-collapse: collapse;
      }

      th,
      td {
        border-bottom: 1px solid #e2e8f0;
        padding: 0.75rem;
        text-align: left;
        font-size: 0.88rem;
      }

      th {
        background: #f8fafc;
        color: #475569;
        font-size: 0.78rem;
      }

      .status-pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.28rem 0.6rem;
        background: #eaf4fb;
        color: #0d78b1;
        font-size: 0.76rem;
        font-weight: 800;
      }

      @media (max-width: 900px) {
        .notifications-hero,
        .content-grid,
        .form-grid {
          grid-template-columns: 1fr;
          display: grid;
        }
      }
    `
  ]
})
export class NotificationsHomeComponent {
  audience = 'Membership Expiring Soon';
  channel = 'WhatsApp';
  message = 'Hi {{name}}, your gym membership is expiring soon. Renew today and keep your fitness streak active.';

  metrics: NotificationMetric[] = isDemoDataEmptyMode() ? [
    { label: 'Renewal Reminders', value: 0, note: 'Due in next 7 days', icon: 'pi pi-refresh' },
    { label: 'Birthday Wishes', value: 0, note: 'Scheduled today', icon: 'pi pi-gift' },
    { label: 'Offer Campaigns', value: 0, note: 'Active this month', icon: 'pi pi-megaphone' },
    { label: 'WhatsApp Automation', value: '0%', note: 'Delivery success', icon: 'pi pi-whatsapp' }
  ] : [
    { label: 'Renewal Reminders', value: 24, note: 'Due in next 7 days', icon: 'pi pi-refresh' },
    { label: 'Birthday Wishes', value: 8, note: 'Scheduled today', icon: 'pi pi-gift' },
    { label: 'Offer Campaigns', value: 3, note: 'Active this month', icon: 'pi pi-megaphone' },
    { label: 'WhatsApp Automation', value: '92%', note: 'Delivery success', icon: 'pi pi-whatsapp' }
  ];

  automationCards = [
    {
      title: 'Renewal Reminders',
      copy: 'Auto-send reminders before expiry, on expiry day, and after overdue payment.',
      icon: 'pi pi-refresh',
      enabled: true
    },
    {
      title: 'Birthday Wishes',
      copy: 'Send personalized birthday messages with coupons or free PT session offers.',
      icon: 'pi pi-gift',
      enabled: true
    },
    {
      title: 'Offer Campaigns',
      copy: 'Broadcast festival offers, referral rewards, trial passes, and win-back campaigns.',
      icon: 'pi pi-megaphone',
      enabled: true
    },
    {
      title: 'WhatsApp Automation',
      copy: 'Automate delivery receipts, payment links, follow-ups, and campaign reminders.',
      icon: 'pi pi-whatsapp',
      enabled: false
    }
  ];

  templates = [
    {
      title: 'Renewal Reminder',
      icon: 'pi pi-refresh',
      copy: 'Hi {{name}}, your membership expires on {{expiryDate}}. Renew now to avoid interruption.'
    },
    {
      title: 'Birthday Wish',
      icon: 'pi pi-gift',
      copy: 'Happy Birthday {{name}}! Your gym family wishes you a strong and healthy year ahead.'
    },
    {
      title: 'Offer Campaign',
      icon: 'pi pi-megaphone',
      copy: 'Special offer: Get 20% off on renewal this week. Reply YES to claim your fitness deal.'
    },
    {
      title: 'Inactive Follow-up',
      icon: 'pi pi-bell',
      copy: 'Hi {{name}}, we missed you at the gym. Book a comeback session with your trainer today.'
    }
  ];

  campaigns: Campaign[] = isDemoDataEmptyMode() ? [] : [
    {
      title: '7-Day Renewal Reminder',
      audience: 'Expiring Soon',
      channel: 'WhatsApp',
      status: 'Scheduled',
      scheduledAt: 'Tomorrow, 9:00 AM'
    },
    {
      title: 'Birthday Coupon',
      audience: 'Birthday Members',
      channel: 'SMS + WhatsApp',
      status: 'Active',
      scheduledAt: 'Daily, 8:00 AM'
    },
    {
      title: 'Summer Fitness Offer',
      audience: 'Inactive Members',
      channel: 'WhatsApp',
      status: 'Draft',
      scheduledAt: 'Not scheduled'
    }
  ];
}
