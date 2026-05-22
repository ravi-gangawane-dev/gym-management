import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { FilterConfig, FilterState } from '../../../../shared/components/dynamic-filters/dynamic-filters.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProfileImageViewerComponent } from '../../../../shared/components/profile-image-viewer/profile-image-viewer.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Member } from '../../../../core/models/member.model';
import { MemberService } from '../../../../core/services/member.service';
import { PlanService } from '../../../../core/services/plan.service';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

type MemberStatus = 'Active' | 'Inactive' | 'Pending' | 'Expired';

interface MemberRow {
  id: string;
  memberId: string;
  photo: string;
  name: string;
  planType: string;
  joiningDate: string;
  expiryDate: string;
  joiningDateValue: string;
  expiryDateValue: string;
  status: MemberStatus;
  trainer: string;
}

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DatePickerModule,
    PaginatorModule,
    SelectModule,
    EmptyStateComponent,
    ProfileImageViewerComponent,
    SearchBarComponent,
    TableToolbarComponent
  ],
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent {
  private memberService = inject(MemberService);
  private confirmation = inject(AppConfirmationService);
  private toast = inject(ToastService);
  private readonly filterStorageKey = 'gym_member_filters';

  first = 0;
  rows = 10;

  viewMode: 'table' | 'card' = 'table';
  sortField: keyof MemberRow = 'name';
  sortDirection: 1 | -1 = 1;
  previewImage: { src: string; alt: string } | null = null;
  columnFilters: Partial<Record<keyof MemberRow, string>> = {};
  columnDateFilters: Partial<Record<'joiningDateValue' | 'expiryDateValue', Date | null>> = {};
  filterState: FilterState = {};
  statusOptions = ['All Status', 'Active', 'Inactive', 'Pending', 'Expired'];
  expiryOptions = ['All Expiry', 'Expiring in 7 days', 'Expiring in 30 days', 'Expired'];
  private planService = inject(PlanService);

  constructor() {
    this.restoreFilters();
  }

  get filterConfigs(): FilterConfig[] {
    return [
      { key: 'plan', label: 'Plan', type: 'select', placeholder: 'All plans', options: this.planService.list().map((plan) => plan.name) },
      { key: 'status', label: 'Status', type: 'status', placeholder: 'All status', options: ['Active', 'Inactive', 'Pending', 'Expired'] },
      { key: 'trainer', label: 'Trainer', type: 'trainer', placeholder: 'All trainers', options: this.trainerOptions.filter((option) => option !== 'All Trainers') },
      { key: 'gender', label: 'Gender', type: 'gender', placeholder: 'All genders', options: ['Male', 'Female', 'Other'] },
      { key: 'joiningDate', label: 'Joining Date', type: 'date', placeholder: 'Joined on' },
      { key: 'expiry', label: 'Expiry', type: 'select', placeholder: 'Expiry status', options: ['Expiring in 7 days', 'Expiring in 30 days', 'Expired'] }
    ];
  }

  get planOptions(): string[] {
    return ['All Plans', ...this.planService.list().map((plan) => plan.name)];
  }

  private searchValue = '';
  private planValue = 'All Plans';
  private statusValue = 'All Status';
  private trainerValue = 'All Trainers';
  private expiryValue = 'All Expiry';

  get searchTerm(): string {
    return this.searchValue;
  }

  set searchTerm(value: string) {
    this.searchValue = value;
    this.persistFilters();
    this.resetPage();
  }

  get planFilter(): string {
    return this.planValue;
  }

  set planFilter(value: string) {
    this.planValue = value;
    this.resetPage();
  }

  get statusFilter(): string {
    return this.statusValue;
  }

  set statusFilter(value: string) {
    this.statusValue = value;
    this.resetPage();
  }

  get trainerOptions(): string[] {
    return ['All Trainers', ...Array.from(new Set(this.members.map((member) => member.trainer))).sort()];
  }

  get trainerFilter(): string {
    return this.trainerValue;
  }

  set trainerFilter(value: string) {
    this.trainerValue = value;
    this.resetPage();
  }

  get expiryFilter(): string {
    return this.expiryValue;
  }

  set expiryFilter(value: string) {
    this.expiryValue = value;
    this.resetPage();
  }

  get members(): MemberRow[] {
    return this.memberService.list().map((member, index) => this.toMemberRow(member, index));
  }

  get totalMembers(): number {
    return this.filteredMembers.length;
  }

  get totalMembersCount(): number {
    return this.members.length;
  }

  get activeMembersCount(): number {
    return this.members.filter((member) => member.status === 'Active').length;
  }

  get inactiveMembersCount(): number {
    return this.members.filter((member) => member.status === 'Inactive').length;
  }

  get expiringMembersCount(): number {
    const today = new Date();
    const soon = new Date(today);
    soon.setDate(today.getDate() + 7);

    return this.members.filter((member) => {
      const expiry = new Date(member.expiryDateValue);
      return (
        member.status === 'Active' &&
        !Number.isNaN(expiry.getTime()) &&
        expiry >= today &&
        expiry <= soon
      );
    }).length;
  }

  get expiredMembersCount(): number {
    return this.members.filter((member) => member.status === 'Expired').length;
  }

  setViewMode(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  filterByStatus(status: 'All Status' | MemberStatus): void {
    this.statusFilter = status;
  }

  filterByExpiry(expiry: string): void {
    this.expiryFilter = expiry;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.planFilter = 'All Plans';
    this.statusFilter = 'All Status';
    this.trainerFilter = 'All Trainers';
    this.expiryFilter = 'All Expiry';
    this.filterState = {};
    this.persistFilters();
  }

  applyFilters(): void {
    this.persistFilters();
    this.resetPage();
  }

  setDynamicFilters(filters: FilterState): void {
    this.filterState = { ...filters };
    this.persistFilters();
    this.resetPage();
  }

  get filteredMembers(): MemberRow[] {
    const term = this.searchValue.trim().toLowerCase();
    const selectedPlan = this.planValue !== 'All Plans' ? this.planValue : '';
    const selectedStatus = this.statusValue !== 'All Status' ? this.statusValue : '';
    const selectedTrainer = this.trainerValue !== 'All Trainers' ? this.trainerValue : '';
    const selectedExpiry = this.expiryValue !== 'All Expiry' ? this.expiryValue : '';

    const filtered = this.members.filter((member) => {
      const matchesSearch =
        !term ||
        [member.memberId, member.name, member.planType, member.trainer, member.status]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchesPlan = !selectedPlan || member.planType === selectedPlan;
      const matchesStatus = !selectedStatus || member.status === selectedStatus;
      const matchesTrainer = !selectedTrainer || member.trainer === selectedTrainer;
      const matchesExpiry = !selectedExpiry || this.matchesExpiryFilter(member, selectedExpiry);

      return matchesSearch && matchesPlan && matchesStatus && matchesTrainer && matchesExpiry && this.matchesColumnFilters(member);
    });

    return this.sortRows(filtered);
  }

  get pagedMembers(): MemberRow[] {
    return this.filteredMembers.slice(this.first, this.first + this.rows);
  }

  get showingStart(): number {
    return this.totalMembers ? this.first + 1 : 0;
  }

  get showingEnd(): number {
    return Math.min(this.first + this.rows, this.totalMembers);
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  trackByMember(_: number, member: MemberRow): string {
    return member.id;
  }

  sortBy(field: keyof MemberRow): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortDirection = 1;
    }
    this.resetPage();
  }

  sortIcon(field: keyof MemberRow): string {
    if (this.sortField !== field) {
      return 'pi pi-sort-alt';
    }

    return this.sortDirection === 1 ? 'pi pi-sort-amount-down-alt' : 'pi pi-sort-amount-up';
  }

  openImagePreview(member: MemberRow): void {
    this.previewImage = { src: member.photo, alt: member.name };
  }

  onColumnFilterChange(): void {
    this.persistFilters();
    this.resetPage();
  }

  clearColumnFilter(field: keyof MemberRow): void {
    this.columnFilters[field] = '';
    this.onColumnFilterChange();
  }

  clearColumnDateFilter(field: 'joiningDateValue' | 'expiryDateValue'): void {
    this.columnDateFilters[field] = null;
    this.onColumnFilterChange();
  }

  deleteMember(memberId: string): void {
    const member = this.members.find((item) => item.id === memberId);
    this.confirmation.permanentDelete({
      name: member?.name ?? 'this member',
      accept: () => {
        this.memberService.delete(memberId);
        this.toast.success('Member Deleted', 'The member has been removed successfully.');
      }
    });
  }

  private resetPage(): void {
    this.first = 0;
  }

  private toMemberRow(member: Member, index: number): MemberRow {
    const joiningDate = member.startDate || new Date().toISOString().slice(0, 10);
    const expiryDate = this.getExpiryDate(joiningDate, member.duration);

    return {
      id: member.id,
      memberId: this.toDisplayMemberId(member.id, index),
      photo: this.getPhotoUrl(member, index),
      name: member.fullName || `${member.firstName} ${member.lastName}`.trim() || 'Member Name',
      planType: member.planName || 'Plan Type',
      joiningDate: this.formatDate(joiningDate),
      expiryDate: this.formatDate(expiryDate),
      joiningDateValue: joiningDate,
      expiryDateValue: expiryDate,
      status: this.getStatus(member.active, expiryDate),
      trainer: member.trainer || 'Unassigned'
    };
  }

  private matchesExpiryFilter(member: MemberRow, filter: string): boolean {
    const expiry = new Date(member.expiryDateValue);
    if (Number.isNaN(expiry.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    if (filter === 'Expired') {
      return expiry < today || member.status === 'Expired';
    }

    const days = filter === 'Expiring in 30 days' ? 30 : 7;
    const soon = new Date(today);
    soon.setDate(today.getDate() + days);

    return member.status === 'Active' && expiry >= today && expiry <= soon;
  }

  private toDisplayMemberId(id: string, index: number): string {
    const numericPart = id.replace(/\D/g, '').slice(0, 3);
    return `1231${String(index + 1).padStart(3, '0')}${numericPart}`.slice(0, 7);
  }

  private getPhotoUrl(member: Member, index: number): string {
    if (member.photo?.startsWith('data:') || member.photo?.startsWith('blob:') || member.photo?.startsWith('http')) {
      return member.photo;
    }

    return `https://i.pravatar.cc/48?img=${(index % 60) + 1}`;
  }

  private getExpiryDate(startDate: string, duration: number): string {
    const date = new Date(startDate);

    if (Number.isNaN(date.getTime())) {
      return startDate;
    }

    date.setMonth(date.getMonth() + (duration || 1));
    return date.toISOString().slice(0, 10);
  }

  private getStatus(active: boolean, expiryDate: string): MemberStatus {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!active) {
      return 'Inactive';
    }

    if (!Number.isNaN(expiry.getTime()) && expiry < today) {
      return 'Expired';
    }

    return 'Active';
  }

  private formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private sortRows(rows: MemberRow[]): MemberRow[] {
    const field = this.sortField;
    const direction = this.sortDirection;

    return [...rows].sort((a, b) => {
      const left = String(a[field] ?? '').toLowerCase();
      const right = String(b[field] ?? '').toLowerCase();
      return left.localeCompare(right, undefined, { numeric: true }) * direction;
    });
  }

  private matchesColumnFilters(member: MemberRow): boolean {
    const textMatches = (Object.entries(this.columnFilters) as Array<[keyof MemberRow, string]>).every(([field, value]) => {
      const term = value?.trim().toLowerCase();
      return !term || String(member[field] ?? '').toLowerCase().includes(term);
    });

    return (
      textMatches &&
      this.matchesColumnDate(member.joiningDateValue, this.columnDateFilters.joiningDateValue) &&
      this.matchesColumnDate(member.expiryDateValue, this.columnDateFilters.expiryDateValue)
    );
  }

  private matchesColumnDate(value: string, selected?: Date | null): boolean {
    if (!selected) {
      return true;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === selected.toISOString().slice(0, 10);
  }

  private matchesDynamicFilters(member: MemberRow): boolean {
    const plan = this.filterState['plan'];
    const status = this.filterState['status'];
    const trainer = this.filterState['trainer'];
    const gender = this.filterState['gender'];
    const expiry = this.filterState['expiry'];
    const joiningDate = this.filterState['joiningDate'];
    const sourceMember = this.memberService.getById(member.id);

    return (
      (!plan || member.planType === plan) &&
      (!status || member.status === status) &&
      (!trainer || member.trainer === trainer) &&
      (!gender || sourceMember?.gender === gender) &&
      (!expiry || this.matchesExpiryFilter(member, String(expiry))) &&
      (!joiningDate || this.isSameDate(member.joiningDateValue, joiningDate))
    );
  }

  private isSameDate(value: string, filter: unknown): boolean {
    const date = new Date(value);
    const selected = filter instanceof Date ? filter : new Date(String(filter));

    return (
      !Number.isNaN(date.getTime()) &&
      !Number.isNaN(selected.getTime()) &&
      date.toISOString().slice(0, 10) === selected.toISOString().slice(0, 10)
    );
  }

  private persistFilters(): void {
    localStorage.setItem(
      this.filterStorageKey,
      JSON.stringify({
        search: this.searchValue,
        dynamic: this.filterState,
        columns: this.columnFilters,
        dates: this.columnDateFilters
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
        columns?: Partial<Record<keyof MemberRow, string>>;
        dates?: Partial<Record<'joiningDateValue' | 'expiryDateValue', string>>;
      };
      this.searchValue = parsed.search ?? '';
      this.filterState = parsed.dynamic ?? {};
      if (this.filterState['joiningDate']) {
        this.filterState['joiningDate'] = new Date(String(this.filterState['joiningDate']));
      }
      this.columnFilters = parsed.columns ?? {};
      this.columnDateFilters = {
        joiningDateValue: parsed.dates?.joiningDateValue ? new Date(parsed.dates.joiningDateValue) : null,
        expiryDateValue: parsed.dates?.expiryDateValue ? new Date(parsed.dates.expiryDateValue) : null
      };
    } catch {
      localStorage.removeItem(this.filterStorageKey);
    }
  }
}
