import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Plan } from '../../../../core/models/plan.model';
import { PlanService } from '../../../../core/services/plan.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-plan-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule],
    template: `
    <div class="plan-form-screen">
      <div class="plan-form-card">
        <div class="form-header">
          <div>
            <h2>{{ mode === 'edit' ? 'Edit Plan' : 'Create New Plan' }}</h2>
            <p>{{ mode === 'edit' ? 'Update plan details and pricing.' : 'Create a new membership plan for your gym.' }}</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="plan-form">
          <div class="field-set">
            <label>Plan Name</label>
            <input pInputText formControlName="name" placeholder="Enter plan name" />
          </div>

          <div class="field-set">
            <label>Price</label>
            <input pInputText type="number" formControlName="price" placeholder="Enter price" />
          </div>

          <div class="field-group">
            <div class="field-set">
              <label>Duration (months)</label>
              <input pInputText type="number" formControlName="durationMonths" placeholder="Duration" />
            </div>

            <div class="field-set">
              <label>Sessions / week</label>
              <input pInputText type="number" formControlName="sessionsPerWeek" placeholder="Sessions per week" />
            </div>
          </div>

          <div class="field-set">
            <label>Status</label>
            <select formControlName="status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="field-set full-width">
            <label>Description</label>
            <textarea pInputTextarea formControlName="description" rows="5" placeholder="Brief description of the plan"></textarea>
          </div>

          <div class="button-row">
            <button pButton type="submit" label="Save Plan" [disabled]="form.invalid"></button>
            <button pButton type="button" label="Cancel" class="cancel-button" (click)="cancel()"></button>
          </div>
        </form>
      </div>
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

      .plan-form-screen {
        min-height: calc(100vh - 110px);
        padding: 1rem;
      }

      .plan-form-card {
        width: min(100%, 920px);
        margin: 0 auto;
        padding: 1rem;
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
      }

      .form-header {
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: var(--app-radius);
        color: #ffffff;
        background: var(--app-hero);
      }

      .form-header h2,
      .form-header p {
        margin: 0;
      }

      .form-header p {
        margin-top: 0.35rem;
        color: rgba(255, 255, 255, 0.86);
      }

      .plan-form {
        display: grid;
        gap: 1rem;
      }

      .field-group {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .field-set {
        display: grid;
        gap: 0.5rem;
      }

      .field-set label {
        color: var(--app-text);
        font-weight: 800;
      }

      input[pInputText],
      textarea[pInputTextarea],
      select {
        width: 100%;
        min-height: 2.55rem;
        border: 1px solid #c7d3df;
        border-radius: 8px;
        background: #ffffff;
        color: var(--app-text);
      }

      textarea[pInputTextarea] {
        padding: 0.65rem 0.75rem;
      }

      select {
        padding: 0 0.75rem;
      }

      .button-row {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      :host ::ng-deep .button-row .p-button {
        height: 2.55rem;
        border-radius: 8px;
        font-weight: 800;
      }

      :host ::ng-deep .cancel-button.p-button {
        border-color: var(--app-border);
        background: var(--app-surface-soft);
        color: var(--app-text);
      }

      @media (max-width: 720px) {
        .field-group {
          grid-template-columns: 1fr;
        }

        .button-row {
          flex-direction: column;
        }
      }
    `
    ]
})
export class PlanFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private planService = inject(PlanService);
    private toast = inject(ToastService);

    mode: 'add' | 'edit' = 'add';
    planId: string | null = null;
    plan?: Plan;

    form = this.fb.group({
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        durationMonths: [1, [Validators.required, Validators.min(1)]],
        sessionsPerWeek: [1, [Validators.required, Validators.min(1)]],
        status: ['Active', Validators.required],
        description: ['']
    });

    ngOnInit(): void {
        this.planId = this.route.snapshot.paramMap.get('id');
        if (!this.planId) {
            return;
        }

        const existingPlan = this.planService.getById(this.planId);
        if (!existingPlan) {
            this.toast.error('Plan Not Found', 'Unable to find the requested plan.');
            this.router.navigateByUrl('/plans');
            return;
        }

        this.mode = 'edit';
        this.plan = existingPlan;
        this.form.patchValue({
            name: existingPlan.name,
            price: existingPlan.price,
            durationMonths: existingPlan.durationMonths,
            sessionsPerWeek: existingPlan.sessionsPerWeek,
            status: existingPlan.status,
            description: existingPlan.description
        });
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.form.getRawValue() as Omit<Plan, 'id' | 'createdAt'>;

        if (this.mode === 'edit' && this.planId) {
            this.planService.update(this.planId, payload);
            this.toast.success('Plan Updated', 'The membership plan has been updated.');
        } else {
            this.planService.add(payload);
            this.toast.success('Plan Created', 'The new membership plan has been added.');
        }

        this.router.navigateByUrl('/plans');
    }

    cancel(): void {
        this.router.navigateByUrl('/plans');
    }
}
