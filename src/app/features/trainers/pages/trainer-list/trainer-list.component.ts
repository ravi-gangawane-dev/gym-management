import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { FilterConfig, FilterState } from '../../../../shared/components/dynamic-filters/dynamic-filters.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProfileImageViewerComponent } from '../../../../shared/components/profile-image-viewer/profile-image-viewer.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Trainer } from '../../../../core/models/trainer.model';
import { TrainerService } from '../../../../core/services/trainer.service';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

type TrainerStatus = 'Active' | 'Inactive' | 'On Leave';
type StaffRole = 'Trainer' | 'Receptionist' | 'Manager';

interface TrainerRow {
    id: string;
    photo: string;
    name: string;
    role: StaffRole;
    specialization: string;
    phone: string;
    email: string;
    experienceYears: number;
    salary: number;
    permissions: string[];
    status: TrainerStatus;
}

@Component({
    selector: 'app-trainer-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        ButtonModule,
        InputNumberModule,
        InputTextModule,
        PaginatorModule,
        SelectModule,
        EmptyStateComponent,
        ProfileImageViewerComponent,
        SearchBarComponent,
        TableToolbarComponent
    ],
    templateUrl: './trainer-list.component.html',
    styleUrls: ['./trainer-list.component.scss']
})
export class TrainerListComponent {
    private trainerService = inject(TrainerService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);
    private readonly filterStorageKey = 'gym_staff_filters';

    first = 0;
    rows = 10;
    viewMode: 'table' | 'card' = 'table';
    sortField: keyof TrainerRow = 'name';
    sortDirection: 1 | -1 = 1;
    columnFilters: Partial<Record<keyof TrainerRow, string>> = {};
    columnAmountFilters: Partial<Record<'salary' | 'experienceYears', number | null>> = {};
    filterState: FilterState = {};
    previewImage: { src: string; alt: string } | null = null;

    private searchValue = '';
    private statusValue: TrainerStatus | 'All Status' = 'All Status';
    private roleValue: StaffRole | 'All Roles' = 'All Roles';

    statusOptions = ['All Status', 'Active', 'Inactive', 'On Leave'];
    roleOptions = ['All Roles', 'Trainer', 'Receptionist', 'Manager'];

    constructor() {
        this.restoreFilters();
    }

    get filterConfigs(): FilterConfig[] {
        return [
            { key: 'role', label: 'Role', type: 'select', placeholder: 'All roles', options: ['Trainer', 'Receptionist', 'Manager'] },
            { key: 'status', label: 'Status', type: 'status', placeholder: 'All status', options: ['Active', 'Inactive', 'On Leave'] },
            { key: 'gender', label: 'Gender', type: 'gender', placeholder: 'All genders', options: ['Male', 'Female', 'Other'] },
            { key: 'department', label: 'Department', type: 'select', placeholder: 'All departments', options: this.departmentOptions },
            { key: 'salary', label: 'Salary Range', type: 'amount', minPlaceholder: 'Min salary', maxPlaceholder: 'Max salary' }
        ];
    }

    get departmentOptions(): string[] {
        return Array.from(new Set(this.trainers.map((trainer) => trainer.specialization))).sort();
    }

    get searchTerm(): string {
        return this.searchValue;
    }

    set searchTerm(value: string) {
        this.searchValue = value;
        this.persistFilters();
        this.resetPage();
    }

    get statusFilter(): TrainerStatus | 'All Status' {
        return this.statusValue;
    }

    set statusFilter(value: TrainerStatus | 'All Status') {
        this.statusValue = value;
        this.resetPage();
    }

    get roleFilter(): StaffRole | 'All Roles' {
        return this.roleValue;
    }

    set roleFilter(value: StaffRole | 'All Roles') {
        this.roleValue = value;
        this.resetPage();
    }

    get trainers(): TrainerRow[] {
        return this.trainerService.list().map((trainer) => this.toTrainerRow(trainer));
    }

    get totalTrainers(): number {
        return this.filteredTrainers.length;
    }

    get filteredTrainers(): TrainerRow[] {
        const term = this.searchValue.trim().toLowerCase();
        const selectedStatus = this.statusValue !== 'All Status' ? this.statusValue : '';
        const selectedRole = this.roleValue !== 'All Roles' ? this.roleValue : '';

        const filtered = this.trainers.filter((trainer) => {
            const matchesSearch =
                !term ||
                [trainer.name, trainer.role, trainer.specialization, trainer.email, trainer.phone, trainer.status, trainer.permissions.join(' ')]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);
            const matchesStatus = !selectedStatus || trainer.status === selectedStatus;
            const matchesRole = !selectedRole || trainer.role === selectedRole;
            return matchesSearch && matchesStatus && matchesRole && this.matchesColumnFilters(trainer);
        });

        return this.sortRows(filtered);
    }

    get totalStaffCount(): number {
        return this.trainers.length;
    }

    get receptionistCount(): number {
        return this.trainers.filter((trainer) => trainer.role === 'Receptionist').length;
    }

    get managerCount(): number {
        return this.trainers.filter((trainer) => trainer.role === 'Manager').length;
    }

    get activeStaffCount(): number {
        return this.trainers.filter((trainer) => trainer.status === 'Active').length;
    }

    get monthlySalaryTotal(): number {
        return this.trainers.reduce((sum, trainer) => sum + trainer.salary, 0);
    }

    get pagedTrainers(): TrainerRow[] {
        return this.filteredTrainers.slice(this.first, this.first + this.rows);
    }

    get showingStart(): number {
        return this.totalTrainers ? this.first + 1 : 0;
    }

    get showingEnd(): number {
        return Math.min(this.first + this.rows, this.totalTrainers);
    }

    setViewMode(mode: 'table' | 'card'): void {
        this.viewMode = mode;
    }

    applyFilters(): void {
        this.resetPage();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.roleFilter = 'All Roles';
        this.statusFilter = 'All Status';
        this.filterState = {};
        this.persistFilters();
    }

    setDynamicFilters(filters: FilterState): void {
        this.filterState = { ...filters };
        this.persistFilters();
        this.resetPage();
    }

    sortBy(field: keyof TrainerRow): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 1 ? -1 : 1;
        } else {
            this.sortField = field;
            this.sortDirection = 1;
        }
        this.resetPage();
    }

    sortIcon(field: keyof TrainerRow): string {
        if (this.sortField !== field) {
            return 'pi pi-sort-alt';
        }
        return this.sortDirection === 1 ? 'pi pi-sort-amount-down-alt' : 'pi pi-sort-amount-up';
    }

    onColumnFilterChange(): void {
        this.persistFilters();
        this.resetPage();
    }

    clearColumnFilter(field: keyof TrainerRow): void {
        this.columnFilters[field] = '';
        this.onColumnFilterChange();
    }

    clearColumnAmountFilter(field: 'salary' | 'experienceYears'): void {
        this.columnAmountFilters[field] = null;
        this.onColumnFilterChange();
    }

    onPageChange(event: PaginatorState): void {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }

    deleteTrainer(trainerId: string): void {
        const trainer = this.trainers.find((item) => item.id === trainerId);
        this.confirmation.permanentDelete({
            name: trainer?.name ?? 'this staff member',
            accept: () => {
                this.trainerService.delete(trainerId);
                this.toast.success('Staff Deleted', 'Staff member has been removed successfully.');
            }
        });
    }

    openImagePreview(trainer: TrainerRow): void {
        this.previewImage = { src: trainer.photo, alt: trainer.name };
    }

    trackByTrainer(_: number, trainer: TrainerRow): string {
        return trainer.id;
    }

    private resetPage(): void {
        this.first = 0;
    }

    private toTrainerRow(trainer: Trainer, index = this.trainerService.list().findIndex((item) => item.id === trainer.id)): TrainerRow {
        return {
            id: trainer.id,
            photo: this.getPhotoUrl(trainer, index),
            name: trainer.fullName,
            role: trainer.role ?? 'Trainer',
            specialization: trainer.specialization,
            phone: trainer.phone,
            email: trainer.email,
            experienceYears: trainer.experienceYears,
            salary: trainer.salary ?? 35000,
            permissions: trainer.permissions?.length ? trainer.permissions : this.getDefaultPermissions(trainer.role ?? 'Trainer'),
            status: trainer.status
        };
    }

    private getDefaultPermissions(role: StaffRole): string[] {
        const map: Record<StaffRole, string[]> = {
            Trainer: ['Members', 'Attendance', 'PT Sessions'],
            Receptionist: ['Enquiries', 'Payments', 'Attendance'],
            Manager: ['Reports', 'Staff', 'Settings']
        };

        return map[role];
    }

    private sortRows(rows: TrainerRow[]): TrainerRow[] {
        const field = this.sortField;
        const direction = this.sortDirection;
        return [...rows].sort((a, b) => {
            const left = String(a[field] ?? '').toLowerCase();
            const right = String(b[field] ?? '').toLowerCase();
            return left.localeCompare(right, undefined, { numeric: true }) * direction;
        });
    }

    private matchesColumnFilters(trainer: TrainerRow): boolean {
        const textMatches = (Object.entries(this.columnFilters) as Array<[keyof TrainerRow, string]>).every(([field, value]) => {
            const term = value?.trim().toLowerCase();
            const source = Array.isArray(trainer[field]) ? (trainer[field] as string[]).join(' ') : String(trainer[field] ?? '');
            return !term || source.toLowerCase().includes(term);
        });

        return (
            textMatches &&
            (!this.columnAmountFilters.experienceYears || trainer.experienceYears >= this.columnAmountFilters.experienceYears) &&
            (!this.columnAmountFilters.salary || trainer.salary >= this.columnAmountFilters.salary)
        );
    }

    private matchesDynamicFilters(trainer: TrainerRow): boolean {
        const role = this.filterState['role'];
        const status = this.filterState['status'];
        const gender = this.filterState['gender'];
        const department = this.filterState['department'];
        const salary = this.filterState['salary'] as { min?: number | null; max?: number | null } | undefined;
        const sourceTrainer = this.trainerService.getById(trainer.id);

        return (
            (!role || trainer.role === role) &&
            (!status || trainer.status === status) &&
            (!gender || sourceTrainer?.gender === gender) &&
            (!department || trainer.specialization === department) &&
            (!salary?.min || trainer.salary >= salary.min) &&
            (!salary?.max || trainer.salary <= salary.max)
        );
    }

    private getPhotoUrl(trainer: Trainer, index: number): string {
        if (trainer.photo?.startsWith('data:') || trainer.photo?.startsWith('blob:') || trainer.photo?.startsWith('http')) {
            return trainer.photo;
        }

        return `https://i.pravatar.cc/96?img=${((index >= 0 ? index : 0) % 60) + 12}`;
    }

    private persistFilters(): void {
        localStorage.setItem(
            this.filterStorageKey,
            JSON.stringify({
                search: this.searchValue,
                dynamic: this.filterState,
                columns: this.columnFilters,
                amounts: this.columnAmountFilters
            })
        );
    }

    private restoreFilters(): void {
        const saved = localStorage.getItem(this.filterStorageKey);
        if (!saved) {
            return;
        }

        try {
            const parsed = JSON.parse(saved) as {
                search?: string;
                dynamic?: FilterState;
                columns?: Partial<Record<keyof TrainerRow, string>>;
                amounts?: Partial<Record<'salary' | 'experienceYears', number | null>>;
            };
            this.searchValue = parsed.search ?? '';
            this.filterState = parsed.dynamic ?? {};
            this.columnFilters = parsed.columns ?? {};
            this.columnAmountFilters = parsed.amounts ?? {};
        } catch {
            localStorage.removeItem(this.filterStorageKey);
        }
    }
}
