import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { EnquiryService } from '../../../../core/services/enquiry.service';
import { Enquiry, EnquiryStatus, EnquirySource } from '../../../../core/models/enquiry.model';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

@Component({
    selector: 'app-enquiry-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ButtonModule, DatePickerModule, InputTextModule, PaginatorModule, SelectModule, SearchBarComponent, TableToolbarComponent],
    templateUrl: './enquiry-list.component.html',
    styleUrls: ['./enquiry-list.component.scss']
})
export class EnquiryListComponent {
    private enquiryService = inject(EnquiryService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);

    search = '';
    statusFilter: EnquiryStatus | 'All' = 'All';
    sourceFilter: EnquirySource | 'All' = 'All';
    assignedFilter = 'All';
    viewMode: 'active' | 'archived' = 'active';
    first = 0;
    rows = 10;
    sortField: keyof Enquiry = 'createdAt';
    sortDirection: 1 | -1 = -1;
    columnFilters: Partial<Record<keyof Enquiry, string>> = {};
    columnDateFilter: Date | null = null;

    statuses: Array<EnquiryStatus | 'All'> = ['All', 'New', 'In Progress', 'Follow-Up', 'Converted', 'Closed', 'Rejected'];
    sources: Array<EnquirySource | 'All'> = ['All', 'Website', 'Phone', 'Email', 'Referral', 'Walk-in'];
    assignedUsers = ['All', 'Amit', 'Neha', 'Ravi', 'Sanya', 'Maya'];
    priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

    get allEnquiries(): Enquiry[] {
        return this.enquiryService.list(true);
    }

    get activeEnquiries(): Enquiry[] {
        return this.allEnquiries.filter((enquiry) => !enquiry.deleted);
    }

    get archivedEnquiries(): Enquiry[] {
        return this.allEnquiries.filter((enquiry) => enquiry.deleted);
    }

    get enquiries(): Enquiry[] {
        return this.viewMode === 'archived' ? this.archivedEnquiries : this.activeEnquiries;
    }

    get filteredEnquiries(): Enquiry[] {
        const term = this.search.trim().toLowerCase();
        const filtered = this.enquiries.filter((enquiry) => {
            const matchesSearch =
                !term ||
                [enquiry.customerName, enquiry.productService, enquiry.contactNumber, enquiry.assignedTo, enquiry.status]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            const matchesStatus = this.statusFilter === 'All' || enquiry.status === this.statusFilter;
            const matchesSource = this.sourceFilter === 'All' || enquiry.source === this.sourceFilter;
            const matchesAssigned = this.assignedFilter === 'All' || enquiry.assignedTo === this.assignedFilter;
            return matchesSearch && matchesStatus && matchesSource && matchesAssigned && this.matchesColumnFilters(enquiry);
        });

        return this.sortRows(filtered);
    }

    get pagedEnquiries(): Enquiry[] {
        return this.filteredEnquiries.slice(this.first, this.first + this.rows);
    }

    get totalEnquiries(): number {
        return this.filteredEnquiries.length;
    }

    get newCount(): number {
        return this.activeEnquiries.filter((enquiry) => enquiry.status === 'New').length;
    }

    get followUpCount(): number {
        return this.activeEnquiries.filter((enquiry) => enquiry.status === 'Follow-Up').length;
    }

    get convertedCount(): number {
        return this.activeEnquiries.filter((enquiry) => enquiry.status === 'Converted').length;
    }

    get archivedCount(): number {
        return this.archivedEnquiries.length;
    }

    get showingStart(): number {
        return this.totalEnquiries ? this.first + 1 : 0;
    }

    get showingEnd(): number {
        return Math.min(this.first + this.rows, this.totalEnquiries);
    }

    get statusOptions(): EnquiryStatus[] {
        return this.statuses.filter((status): status is EnquiryStatus => status !== 'All');
    }

    get statusCounts() {
        return this.enquiries.reduce((counts, enquiry) => {
            counts[enquiry.status] = (counts[enquiry.status] || 0) + 1;
            return counts;
        }, {} as Record<EnquiryStatus, number>);
    }

    onPageChange(event: PaginatorState): void {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }

    setSearch(value: string): void {
        this.search = value;
        this.first = 0;
    }

    setViewMode(mode: 'active' | 'archived'): void {
        this.viewMode = mode;
        this.first = 0;
    }

    sortBy(field: keyof Enquiry): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 1 ? -1 : 1;
        } else {
            this.sortField = field;
            this.sortDirection = 1;
        }
        this.first = 0;
    }

    sortIcon(field: keyof Enquiry): string {
        if (this.sortField !== field) {
            return 'pi pi-sort-alt';
        }

        return this.sortDirection === 1 ? 'pi pi-sort-amount-down-alt' : 'pi pi-sort-amount-up';
    }

    onColumnFilterChange(): void {
        this.first = 0;
    }

    clearColumnFilter(field: keyof Enquiry): void {
        this.columnFilters[field] = '';
        this.onColumnFilterChange();
    }

    clearColumnDateFilter(): void {
        this.columnDateFilter = null;
        this.onColumnFilterChange();
    }

    deleteEnquiry(id: string): void {
        this.confirmation.archive({
            message: 'Are you sure you want to archive this enquiry? It will be shown in the archived enquiry list.',
            accept: () => {
                this.enquiryService.softDelete(id);
                this.viewMode = 'archived';
                this.first = 0;
                this.toast.success('Enquiry Archived', 'Showing the archived enquiry list now.');
            }
        });
    }

    restoreEnquiry(id: string): void {
        this.enquiryService.restore(id);
        this.first = 0;
        this.toast.success('Enquiry Restored', 'The enquiry is back in the active list.');
    }

    permanentDeleteEnquiry(enquiry: Enquiry): void {
        this.confirmation.permanentDelete({
            name: enquiry.customerName,
            accept: () => {
                this.enquiryService.permanentDelete(enquiry.id);
                this.first = 0;
                this.toast.success('Enquiry Deleted', 'The enquiry has been removed permanently.');
            }
        });
    }

    getBadgeClass(status: EnquiryStatus): string {
        switch (status) {
            case 'New':
                return 'badge-new';
            case 'In Progress':
                return 'badge-inprogress';
            case 'Follow-Up':
                return 'badge-followup';
            case 'Converted':
                return 'badge-converted';
            case 'Closed':
                return 'badge-closed';
            case 'Rejected':
                return 'badge-rejected';
        }
    }

    private sortRows(rows: Enquiry[]): Enquiry[] {
        const field = this.sortField;
        const direction = this.sortDirection;

        return [...rows].sort((a, b) => {
            const left = String(a[field] ?? '').toLowerCase();
            const right = String(b[field] ?? '').toLowerCase();
            return left.localeCompare(right, undefined, { numeric: true }) * direction;
        });
    }

    private matchesColumnFilters(enquiry: Enquiry): boolean {
        const textMatches = (Object.entries(this.columnFilters) as Array<[keyof Enquiry, string]>).every(([field, value]) => {
            const term = value?.trim().toLowerCase();
            return !term || String(enquiry[field] ?? '').toLowerCase().includes(term);
        });

        const createdAt = new Date(enquiry.createdAt);

        return (
            textMatches &&
            (!this.columnDateFilter ||
                (!Number.isNaN(createdAt.getTime()) &&
                    createdAt.toISOString().slice(0, 10) === this.columnDateFilter.toISOString().slice(0, 10)))
        );
    }
}
