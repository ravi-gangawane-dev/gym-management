import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { Plan } from '../../../../core/models/plan.model';
import { PlanService } from '../../../../core/services/plan.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

type PlanStatusFilter = Plan['status'] | 'All Status';

@Component({
    selector: 'app-plans-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputNumberModule, InputTextModule, PaginatorModule, SelectModule, SearchBarComponent, TableToolbarComponent],
    templateUrl: './plans-home.component.html',
    styleUrls: ['./plans-home.component.scss']
})
export class PlansHomeComponent {
    private planService = inject(PlanService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);

    first = 0;
    rows = 10;
    viewMode: 'table' | 'card' = 'table';
    sortField: keyof Plan = 'name';
    sortDirection: 1 | -1 = 1;
    columnFilters: Partial<Record<keyof Plan, string>> = {};
    columnAmountFilters: Partial<Record<'price' | 'durationMonths' | 'sessionsPerWeek', number | null>> = {};

    private searchValue = '';
    private statusValue: PlanStatusFilter = 'All Status';

    statusOptions: PlanStatusFilter[] = ['All Status', 'Active', 'Inactive'];

    templatePlans: Array<Omit<Plan, 'id' | 'createdAt'>> = [
        {
            name: '1 Month',
            price: 999,
            durationMonths: 1,
            sessionsPerWeek: 3,
            status: 'Active',
            description: 'Jumpstart training with a compact monthly commitment.'
        },
        {
            name: '3 Month',
            price: 2699,
            durationMonths: 3,
            sessionsPerWeek: 4,
            status: 'Active',
            description: 'Build strength and consistency with a focused quarter-year plan.'
        },
        {
            name: '6 Month',
            price: 4999,
            durationMonths: 6,
            sessionsPerWeek: 4,
            status: 'Active',
            description: 'Ideal for transformation, steady improvement, and momentum.'
        },
        {
            name: '12 Month',
            price: 8999,
            durationMonths: 12,
            sessionsPerWeek: 5,
            status: 'Active',
            description: 'Ultimate premium membership for top performance and savings.'
        }
    ];

    get searchTerm(): string {
        return this.searchValue;
    }

    set searchTerm(value: string) {
        this.searchValue = value;
        this.resetPage();
    }

    get statusFilter(): PlanStatusFilter {
        return this.statusValue;
    }

    set statusFilter(value: PlanStatusFilter) {
        this.statusValue = value;
        this.resetPage();
    }

    get plans(): Plan[] {
        return this.planService.list();
    }

    get filteredPlans(): Plan[] {
        const term = this.searchValue.trim().toLowerCase();
        const selectedStatus = this.statusValue !== 'All Status' ? this.statusValue : '';

        const filtered = this.plans.filter((plan) => {
            const matchesSearch =
                !term ||
                [plan.name, plan.description, plan.status, plan.durationMonths, plan.sessionsPerWeek, plan.price]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);
            const matchesStatus = !selectedStatus || plan.status === selectedStatus;
            return matchesSearch && matchesStatus && this.matchesColumnFilters(plan);
        });

        return this.sortRows(filtered);
    }

    get pagedPlans(): Plan[] {
        return this.filteredPlans.slice(this.first, this.first + this.rows);
    }

    get totalPlans(): number {
        return this.filteredPlans.length;
    }

    get activePlans(): number {
        return this.plans.filter((plan) => plan.status === 'Active').length;
    }

    get inactivePlans(): number {
        return this.plans.filter((plan) => plan.status === 'Inactive').length;
    }

    get averagePrice(): number {
        if (!this.plans.length) {
            return 0;
        }

        return Math.round(this.plans.reduce((sum, plan) => sum + plan.price, 0) / this.plans.length);
    }

    get monthlyPlanCount(): number {
        return this.plans.filter((plan) => plan.durationMonths <= 1).length;
    }

    get showingStart(): number {
        return this.totalPlans ? this.first + 1 : 0;
    }

    get showingEnd(): number {
        return Math.min(this.first + this.rows, this.totalPlans);
    }

    setViewMode(mode: 'table' | 'card'): void {
        this.viewMode = mode;
    }

    applyFilters(): void {
        this.resetPage();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.statusFilter = 'All Status';
    }

    sortBy(field: keyof Plan): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 1 ? -1 : 1;
        } else {
            this.sortField = field;
            this.sortDirection = 1;
        }
        this.resetPage();
    }

    sortIcon(field: keyof Plan): string {
        if (this.sortField !== field) {
            return 'pi pi-sort-alt';
        }
        return this.sortDirection === 1 ? 'pi pi-sort-amount-down-alt' : 'pi pi-sort-amount-up';
    }

    onColumnFilterChange(): void {
        this.resetPage();
    }

    clearColumnFilter(field: keyof Plan): void {
        this.columnFilters[field] = '';
        this.onColumnFilterChange();
    }

    clearColumnAmountFilter(field: 'price' | 'durationMonths' | 'sessionsPerWeek'): void {
        this.columnAmountFilters[field] = null;
        this.onColumnFilterChange();
    }

    onPageChange(event: PaginatorState): void {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }

    addTemplatePlan(plan: Omit<Plan, 'id' | 'createdAt'>): void {
        const createdPlan = this.planService.add(plan);
        this.resetPage();
        this.toast.success('Plan Added', `Added ${createdPlan.name} membership plan.`);
    }

    deletePlan(planId: string): void {
        const plan = this.plans.find((item) => item.id === planId);
        this.confirmation.permanentDelete({
            name: plan?.name ?? 'this plan',
            accept: () => {
                this.planService.delete(planId);
                this.resetPage();
                this.toast.success('Plan Deleted', 'The membership plan was removed successfully.');
            }
        });
    }

    private resetPage(): void {
        this.first = 0;
    }

    private sortRows(rows: Plan[]): Plan[] {
        const field = this.sortField;
        const direction = this.sortDirection;
        return [...rows].sort((a, b) => {
            const left = String(a[field] ?? '').toLowerCase();
            const right = String(b[field] ?? '').toLowerCase();
            return left.localeCompare(right, undefined, { numeric: true }) * direction;
        });
    }

    private matchesColumnFilters(plan: Plan): boolean {
        const textMatches = (Object.entries(this.columnFilters) as Array<[keyof Plan, string]>).every(([field, value]) => {
            const term = value?.trim().toLowerCase();
            return !term || String(plan[field] ?? '').toLowerCase().includes(term);
        });

        return (
            textMatches &&
            (!this.columnAmountFilters.price || plan.price >= this.columnAmountFilters.price) &&
            (!this.columnAmountFilters.durationMonths || plan.durationMonths >= this.columnAmountFilters.durationMonths) &&
            (!this.columnAmountFilters.sessionsPerWeek || plan.sessionsPerWeek >= this.columnAmountFilters.sessionsPerWeek)
        );
    }
}
