import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DemoDataResetService } from '../../../../core/services/demo-data-reset.service';

@Component({
  selector: 'app-profile-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-page">
      <div class="profile-hero">
        <div class="avatar">{{ initials }}</div>
        <div>
          <span>RDG Gym Account</span>
          <h2>{{ user?.name || 'User' }}</h2>
          <p>{{ user?.role || 'Role' }} profile and access overview</p>
        </div>
      </div>

      <div class="profile-grid">
        <article class="profile-card account-card">
          <h3>Profile Details</h3>
          <div class="detail-list">
            <div>
              <span>Full Name</span>
              <strong>{{ user?.name || 'User' }}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{{ user?.email || '-' }}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{{ user?.role || '-' }}</strong>
            </div>
            <div>
              <span>Remember Me</span>
              <strong>{{ user?.rememberMe ? 'Enabled' : 'Disabled' }}</strong>
            </div>
          </div>
        </article>

        <article class="profile-card">
          <h3>Session</h3>
          <div class="session-box">
            <i class="pi pi-clock"></i>
            <div>
              <span>Last Login</span>
              <strong>{{ loginDate }}</strong>
            </div>
          </div>
          <p>Use this account to manage RDG gym modules based on the permissions assigned to your role.</p>
        </article>

        <article class="profile-card permissions-card">
          <h3>Module Access</h3>
          <div class="permission-list">
            <span *ngFor="let permission of permissions">
              <i class="pi pi-check"></i>
              {{ permission }}
            </span>
          </div>
        </article>

        <article class="profile-card">
          <h3>Quick Info</h3>
          <div class="quick-stats">
            <div>
              <strong>{{ permissions.length }}</strong>
              <span>Permissions</span>
            </div>
            <div>
              <strong>{{ user?.role === 'Admin' ? 'Full' : 'Limited' }}</strong>
              <span>Access Level</span>
            </div>
          </div>
        </article>

        <article class="profile-card data-card">
          <div>
            <h3>Data Management</h3>
            <p>Reset application records for clean testing, or reload fresh demo data for UI, filters, pagination, reports, and workflow validation.</p>
          </div>
          <div class="data-actions">
            <button type="button" class="danger-action" (click)="resetAllData()">
              <i class="pi pi-trash"></i>
              Reset to Empty
            </button>
            <button type="button" class="primary-action" (click)="addDummyData()">
              <i class="pi pi-database"></i>
              Add Dummy Data
            </button>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .profile-page {
        display: grid;
        gap: 1rem;
        padding-bottom: 1.5rem;
      }

      .profile-hero,
      .profile-card {
        border: 1px solid #dce5ef;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      }

      .profile-hero {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        background:
          linear-gradient(135deg, rgba(21, 101, 169, 0.12), rgba(245, 130, 32, 0.12)),
          #ffffff;
      }

      .avatar {
        display: grid;
        place-items: center;
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        color: #ffffff;
        background: linear-gradient(135deg, #1565a9, #f58220);
        font-size: 1.8rem;
        font-weight: 900;
      }

      .profile-hero span,
      .detail-list span,
      .session-box span,
      .quick-stats span {
        color: #65748b;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .profile-hero h2,
      .profile-hero p,
      .profile-card h3,
      .profile-card p {
        margin: 0;
      }

      .profile-hero h2 {
        color: #172033;
        font-size: 2rem;
      }

      .profile-hero p,
      .profile-card p {
        color: #65748b;
      }

      .profile-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
        gap: 1rem;
      }

      .profile-card {
        padding: 1.15rem;
      }

      .profile-card h3 {
        margin-bottom: 1rem;
        color: #172033;
        font-size: 1rem;
      }

      .data-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        grid-column: 1 / -1;
        border-color: #cfe2f3;
        background:
          linear-gradient(135deg, rgba(13, 120, 177, 0.08), rgba(239, 120, 10, 0.08)),
          #ffffff;
      }

      .data-card h3 {
        margin-bottom: 0.35rem;
      }

      .data-card p {
        max-width: 760px;
      }

      .data-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.65rem;
      }

      .data-actions button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        min-height: 2.7rem;
        border: 0;
        border-radius: 8px;
        padding: 0 0.9rem;
        color: #ffffff;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
        transition: transform 160ms ease, box-shadow 160ms ease;
        white-space: nowrap;
      }

      .data-actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14);
      }

      .danger-action {
        background: #dc2626;
      }

      .primary-action {
        background: var(--app-primary-action);
      }

      .detail-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
      }

      .detail-list div {
        display: grid;
        gap: 0.25rem;
        padding: 0.85rem;
        border-radius: 10px;
        background: #f4f7fb;
      }

      .detail-list strong,
      .session-box strong,
      .quick-stats strong {
        color: #172033;
      }

      .session-box {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-bottom: 1rem;
      }

      .session-box i {
        display: grid;
        place-items: center;
        width: 2.6rem;
        height: 2.6rem;
        border-radius: 50%;
        color: #1565a9;
        background: #e8f2fb;
      }

      .permissions-card {
        grid-column: 1 / -1;
      }

      .permission-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .permission-list span {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 2rem;
        padding: 0 0.75rem;
        border-radius: 999px;
        color: #1565a9;
        background: #e8f2fb;
        font-weight: 800;
      }

      .quick-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
      }

      .quick-stats div {
        display: grid;
        place-items: center;
        min-height: 5rem;
        border-radius: 10px;
        background: #f4f7fb;
      }

      .quick-stats strong {
        font-size: 1.45rem;
      }

      @media (max-width: 820px) {
        .profile-grid,
        .detail-list {
          grid-template-columns: 1fr;
        }

        .data-card,
        .profile-hero {
          align-items: flex-start;
          flex-direction: column;
        }

        .data-actions {
          justify-content: flex-start;
          width: 100%;
        }
      }
    `
  ]
})
export class ProfileHomeComponent {
  private auth = inject(AuthService);
  private demoData = inject(DemoDataResetService);
  user = this.auth.currentUser();

  get initials(): string {
    const source = this.user?.name || this.user?.role || 'User';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get permissions(): string[] {
    return this.user?.permissions.includes('All') ? ['All Modules'] : this.user?.permissions ?? [];
  }

  get loginDate(): string {
    if (!this.user?.loginAt) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(this.user.loginAt));
  }

  resetAllData(): void {
    const confirmed = window.confirm('Delete all application records and keep the database empty?');

    if (confirmed) {
      this.demoData.resetToEmpty();
    }
  }

  addDummyData(): void {
    const confirmed = window.confirm('Clear current records and load fresh demo data?');

    if (confirmed) {
      this.demoData.loadDummyData();
    }
  }
}
