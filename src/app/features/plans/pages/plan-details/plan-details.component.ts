import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlanService } from '../../../../core/services/plan.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

@Component({
    selector: 'app-plan-details',
    standalone: true,
    imports: [CommonModule, RouterLink, ButtonModule],
    template: `
    <div class="plan-details-screen">
      <div class="plan-details-card" *ngIf="plan; else notFound">
        <div class="details-header">
          <div>
            <h2>{{ plan.name }}</h2>
            <p>Membership plan details and configuration.</p>
          </div>
          <div class="action-buttons">
            <a [routerLink]="['/plans/edit', plan.id]" pButton type="button" icon="pi pi-pencil" label="Edit"></a>
            <button pButton type="button" class="danger" icon="pi pi-trash" label="Delete" (click)="deletePlan()"></button>
            <a routerLink="/plans" pButton type="button" class="secondary" icon="pi pi-arrow-left" label="Back"></a>
          </div>
        </div>

        <div class="details-grid">
          <section>
            <h3>Pricing</h3>
            <p>{{ plan.price | currency:'INR':'symbol':'1.2-2':'en-IN' }}</p>
          </section>
          <section>
            <h3>Duration</h3>
            <p>{{ plan.durationMonths }} month(s)</p>
          </section>
          <section>
            <h3>Weekly Sessions</h3>
            <p>{{ plan.sessionsPerWeek }}</p>
          </section>
          <section>
            <h3>Status</h3>
            <p>{{ plan.status }}</p>
          </section>
        </div>

        <div class="description-card">
          <h3>Description</h3>
          <p>{{ plan.description || 'No description provided.' }}</p>
        </div>
      </div>

      <ng-template #notFound>
        <div class="plan-details-card">
          <h2>Plan not found</h2>
          <p>The requested membership plan could not be loaded.</p>
          <a routerLink="/plans" pButton type="button" icon="pi pi-arrow-left" label="Back to Plans"></a>
        </div>
      </ng-template>
    </div>
  `,
    styles: [
        `
      :host {
        display: block;
        margin: -1rem;
        min-height: calc(100vh - 110px);
        color: var(--app-text);
        background: var(--app-bg);
      }

      .plan-details-screen {
        min-height: calc(100vh - 110px);
        padding: 1rem;
      }

      .plan-details-card {
        width: min(100%, 920px);
        margin: 0 auto;
        padding: 1rem;
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
      }

      .details-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: var(--app-radius);
        color: #ffffff;
        background: var(--app-hero);
      }

      .details-header h2,
      .details-header p {
        margin: 0;
      }

      .details-header p {
        margin-top: 0.35rem;
        color: rgba(255, 255, 255, 0.86);
      }

      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.85rem;
      }

      .details-grid section,
      .description-card {
        padding: 1rem;
        border: 1px solid var(--app-border);
        border-radius: 10px;
        background: var(--app-surface-soft);
      }

      .details-grid h3,
      .details-grid p,
      .description-card h3,
      .description-card p {
        margin: 0;
      }

      .details-grid p {
        margin-top: 0.35rem;
        font-size: 1.25rem;
        font-weight: 800;
      }

      .description-card {
        margin-top: 0.85rem;
      }

      .description-card p {
        margin-top: 0.5rem;
        color: var(--app-muted);
      }

      @media (max-width: 720px) {
        .details-header {
          display: grid;
        }
      }
    `
    ]
})
export class PlanDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private confirmation = inject(AppConfirmationService);
    private planService = inject(PlanService);
    private toast = inject(ToastService);

    planId: string | null = null;
    plan = this.planService.getById(this.route.snapshot.paramMap.get('id') ?? '');

    ngOnInit(): void {
        this.planId = this.route.snapshot.paramMap.get('id');
        if (!this.planId || !this.plan) {
            this.toast.error('Plan Not Found', 'Unable to load this membership plan.');
            this.router.navigateByUrl('/plans');
        }
    }

    deletePlan(): void {
        if (!this.planId) {
            return;
        }

        this.confirmation.permanentDelete({
            name: this.plan?.name ?? 'this plan',
            accept: () => {
                this.planService.delete(this.planId as string);
                this.toast.success('Plan Deleted', 'The membership plan has been removed.');
                this.router.navigateByUrl('/plans');
            }
        });
    }
}
