import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { AttendanceEntry, AttendanceService, CheckInMethod } from '../../../../core/services/attendance.service';
import { Member } from '../../../../core/models/member.model';
import { MemberService } from '../../../../core/services/member.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';

type AttendanceSortField = 'memberName' | 'checkedInAt' | 'method' | 'trainer' | 'status';

interface AttendanceColumnFilters {
  memberName: string;
  checkedInAt: Date | null;
  method: CheckInMethod | null;
  trainer: string;
  status: AttendanceEntry['status'] | null;
}

@Component({
  selector: 'app-attendance-home',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    DatePickerModule,
    PaginatorModule,
    SelectModule,
    EmptyStateComponent,
    SearchBarComponent,
    TableToolbarComponent
  ],
  template: `
    <div class="attendance-page">
      <section class="attendance-hero">
        <div>
          <span class="eyebrow">Live Attendance</span>
          <h2>Gym Attendance Management</h2>
          <p>Fast contactless check-ins, live occupancy, trainer visibility, and renewal validation in one reception view.</p>
        </div>
        <div class="hero-metrics">
          <article>
            <small>Today's Check-ins</small>
            <strong>{{ summary.todaysCheckIns }}</strong>
          </article>
          <article>
            <small>Inside Gym</small>
            <strong>{{ summary.insideGym }}</strong>
          </article>
          <article>
            <small>Peak Time</small>
            <strong>{{ summary.peakTime }}</strong>
          </article>
          <article>
            <small>Late Renewals</small>
            <strong>{{ summary.lateRenewals }}</strong>
          </article>
          <article>
            <small>Absent</small>
            <strong>{{ summary.absentMembers }}</strong>
          </article>
        </div>
      </section>

      <section class="reception-grid">
        <div class="page-card scanner-panel">
          <div class="section-header compact">
            <div>
              <h3>Reception Mode</h3>
              <p>Scan a member or mark a manual check-in.</p>
            </div>
            <span class="live-dot">Live</span>
          </div>

          <div class="scan-actions">
            <button type="button" (click)="quickScan('QR Code')">
              <i class="pi pi-qrcode"></i>
              Scan QR
            </button>
            <button type="button" (click)="quickScan('Face Recognition')">
              <i class="pi pi-camera"></i>
              Face Scan
            </button>
            <button type="button" (click)="quickScan('NFC Card')">
              <i class="pi pi-credit-card"></i>
              NFC Tap
            </button>
            <button type="button" class="secondary" (click)="quickScan('Manual')">
              <i class="pi pi-user-plus"></i>
              Manual Entry
            </button>
          </div>

          <div class="manual-entry">
            <label for="memberSelect">Member</label>
            <select id="memberSelect" [(ngModel)]="selectedMemberId">
              <option *ngFor="let member of members" [value]="member.id">{{ member.fullName || member.firstName }}</option>
            </select>
            <button type="button" (click)="manualCheckIn()">Mark Attendance</button>
          </div>

          <div class="entry-confirmation" [class.blocked]="lastEntry.status === 'Expired Blocked'" *ngIf="lastEntry">
            <i class="pi" [ngClass]="lastEntry.status === 'Expired Blocked' ? 'pi-exclamation-triangle' : 'pi-check-circle'"></i>
            <div>
              <strong>{{ duplicateEntry ? 'Already Checked In' : lastEntry.status === 'Expired Blocked' ? 'Membership Expired' : 'Attendance Marked' }}</strong>
              <span>{{ lastEntry.memberName }} via {{ lastEntry.method }} at {{ lastEntry.checkedInAt | date: 'h:mm a' }}</span>
            </div>
          </div>
        </div>

        <div class="page-card occupancy-panel">
          <div class="section-header compact">
            <div>
              <h3>Live Gym Occupancy</h3>
              <p>Prevent overcrowding and balance peak hours.</p>
            </div>
            <strong>{{ summary.occupancyPercent }}%</strong>
          </div>
          <div class="occupancy-track">
            <span [style.width.%]="summary.occupancyPercent"></span>
          </div>
          <div class="peak-bars">
            <div class="bar-item" *ngFor="let point of hourlyFootfall">
              <span class="bar" [style.height.px]="18 + point.count * 14"></span>
              <small>{{ point.hour }}</small>
            </div>
          </div>
        </div>
      </section>

      <section class="methods-grid">
        <article *ngFor="let method of checkInMethods" class="method-card">
          <i [class]="method.icon"></i>
          <div>
            <h4>{{ method.title }}</h4>
            <p>{{ method.copy }}</p>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <div class="page-card live-table">
          <app-table-toolbar title="Live Check-ins" subtitle="Today">
            <app-search-bar
              [value]="searchTerm"
              placeholder="Search member, trainer"
              (valueChange)="setSearch($event)">
            </app-search-bar>
          </app-table-toolbar>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><button type="button" class="sort-header" (click)="sortBy('memberName')">Member <i [class]="sortIcon('memberName')"></i></button></th>
                  <th><button type="button" class="sort-header" (click)="sortBy('checkedInAt')">Time <i [class]="sortIcon('checkedInAt')"></i></button></th>
                  <th><button type="button" class="sort-header" (click)="sortBy('method')">Method <i [class]="sortIcon('method')"></i></button></th>
                  <th><button type="button" class="sort-header" (click)="sortBy('trainer')">Trainer <i [class]="sortIcon('trainer')"></i></button></th>
                  <th><button type="button" class="sort-header" (click)="sortBy('status')">Status <i [class]="sortIcon('status')"></i></button></th>
                </tr>
                <tr class="column-filter-row">
                  <th>
                    <span class="column-filter-control">
                      <input type="text" [(ngModel)]="columnFilters.memberName" (ngModelChange)="onColumnFilterChange()" placeholder="Type to search" />
                      <button *ngIf="columnFilters.memberName" type="button" class="clear-column-filter" (click)="clearColumnFilter('memberName')" aria-label="Clear member filter">
                        <i class="pi pi-times"></i>
                      </button>
                    </span>
                  </th>
                  <th>
                    <span class="column-filter-control date-filter">
                      <p-datepicker [(ngModel)]="columnFilters.checkedInAt" (ngModelChange)="onColumnFilterChange()" dateFormat="dd M yy" placeholder="Select date" appendTo="body"></p-datepicker>
                      <button *ngIf="columnFilters.checkedInAt" type="button" class="clear-column-filter" (click)="clearColumnFilter('checkedInAt')" aria-label="Clear time filter">
                        <i class="pi pi-times"></i>
                      </button>
                    </span>
                  </th>
                  <th>
                    <span class="column-filter-control">
                      <p-select [options]="methodOptions" [(ngModel)]="columnFilters.method" (ngModelChange)="onColumnFilterChange()" placeholder="Any" appendTo="body" [showClear]="true"></p-select>
                    </span>
                  </th>
                  <th>
                    <span class="column-filter-control">
                      <input type="text" [(ngModel)]="columnFilters.trainer" (ngModelChange)="onColumnFilterChange()" placeholder="Type to search" />
                      <button *ngIf="columnFilters.trainer" type="button" class="clear-column-filter" (click)="clearColumnFilter('trainer')" aria-label="Clear trainer filter">
                        <i class="pi pi-times"></i>
                      </button>
                    </span>
                  </th>
                  <th>
                    <span class="column-filter-control">
                      <p-select [options]="statusOptions" [(ngModel)]="columnFilters.status" (ngModelChange)="onColumnFilterChange()" placeholder="Select One" appendTo="body" [showClear]="true"></p-select>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of pagedEntries; trackBy: trackByEntry">
                  <td>
                    <strong>{{ entry.memberName }}</strong>
                    <small>{{ entry.membershipType }}</small>
                  </td>
                  <td>{{ entry.checkedInAt | date: 'h:mm a' }}</td>
                  <td>{{ entry.method }}</td>
                  <td>{{ entry.trainer }}</td>
                  <td><span class="status-pill" [ngClass]="statusClass(entry)">{{ entry.status }}</span></td>
                </tr>
              </tbody>
            </table>

            <app-empty-state
              *ngIf="totalEntries === 0"
              icon="pi pi-calendar-clock"
              title="No attendance records"
              message="Adjust filters or mark a new attendance entry.">
            </app-empty-state>
          </div>

          <footer class="table-footer">
            <span>Showing {{ showingStart }} to {{ showingEnd }} of {{ totalEntries }}</span>
            <div class="card flex justify-center pagination-card">
              <p-paginator (onPageChange)="onPageChange($event)" [first]="first" [rows]="rows"
                [totalRecords]="totalEntries" [rowsPerPageOptions]="[10, 20, 30]" />
            </div>
          </footer>
        </div>

        <aside class="side-stack">
          <div class="page-card rule-card">
            <h3>Smart Rules</h3>
            <div class="rule-row">
              <i class="pi pi-shield"></i>
              <span>Prevent duplicate daily entries</span>
            </div>
            <div class="rule-row">
              <i class="pi pi-id-card"></i>
              <span>Validate active membership before entry</span>
            </div>
            <div class="rule-row">
              <i class="pi pi-bell"></i>
              <span>Notify trainer after assigned member check-in</span>
            </div>
          </div>

          <div class="page-card trainer-card">
            <h3>Trainer View</h3>
            <div class="trainer-row" *ngFor="let trainer of trainerAttendance">
              <span>{{ trainer.name }}</span>
              <strong>{{ trainer.count }}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section class="page-card reports-panel">
        <div>
          <h3>Attendance Navigation</h3>
          <p>Live Check-ins, QR Scanner, Member History, Occupancy, Reports, Inactive Members, Device Management.</p>
        </div>
        <div class="report-tags">
          <span>Daily Attendance</span>
          <span>Monthly Trends</span>
          <span>Peak Hours</span>
          <span>Inactive Members</span>
          <span>PDF</span>
          <span>Excel</span>
          <span>CSV</span>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .attendance-page {
        display: grid;
        gap: 1rem;
      }

      .attendance-hero {
        background: var(--app-hero);
        border-radius: 12px;
        color: #fff;
        padding: 1.35rem;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .attendance-hero h2,
      .attendance-hero p {
        margin: 0;
      }

      .attendance-hero h2 {
        font-size: 1.7rem;
      }

      .attendance-hero p {
        max-width: 680px;
        margin-top: 0.35rem;
        color: rgba(255, 255, 255, 0.88);
      }

      .eyebrow {
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #ffe3c2;
      }

      .hero-metrics {
        display: grid;
        grid-template-columns: repeat(5, minmax(110px, 1fr));
        gap: 0.75rem;
      }

      .hero-metrics article {
        border: 1px solid rgba(255, 255, 255, 0.32);
        border-radius: 10px;
        padding: 0.85rem;
        background: rgba(255, 255, 255, 0.12);
      }

      .hero-metrics strong {
        display: block;
        margin-top: 0.45rem;
        font-size: 1.35rem;
      }

      .hero-metrics small {
        color: rgba(255, 255, 255, 0.86);
        font-weight: 800;
      }

      .metric-card small,
      .section-header p,
      .method-card p,
      .reports-panel p,
      td small {
        color: #64748b;
      }

      .metrics-grid,
      .methods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.85rem;
      }

      .metric-card,
      .method-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .metric-card span {
        color: #64748b;
        font-size: 0.84rem;
        font-weight: 700;
      }

      .metric-card strong {
        display: block;
        margin: 0.3rem 0;
        font-size: 1.8rem;
        color: #0d78b1;
      }

      .metric-card.warning strong {
        color: #d96500;
      }

      .reception-grid,
      .content-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.75fr);
        gap: 1rem;
      }

      .section-header.compact {
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 0.85rem;
      }

      .section-header h3,
      .section-header p,
      .rule-card h3,
      .trainer-card h3,
      .reports-panel h3,
      .method-card h4 {
        margin: 0;
      }

      .scan-actions {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.65rem;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      button i {
        margin-right: 0.35rem;
      }

      button.secondary {
        background: var(--app-secondary-action);
      }

      .manual-entry {
        margin-top: 0.8rem;
        display: grid;
        grid-template-columns: 80px minmax(0, 1fr) auto;
        gap: 0.6rem;
        align-items: center;
      }

      select,
      input {
        width: 100%;
        border: 1px solid #d2dce8;
        border-radius: 8px;
        padding: 0.68rem 0.75rem;
        font: inherit;
      }

      .entry-confirmation {
        margin-top: 0.8rem;
        border: 1px solid #bbf7d0;
        background: #f0fdf4;
        color: #166534;
        border-radius: 8px;
        padding: 0.75rem;
        display: flex;
        gap: 0.65rem;
        align-items: center;
      }

      .entry-confirmation.blocked {
        border-color: #fed7aa;
        background: #fff7ed;
        color: #9a3412;
      }

      .entry-confirmation span,
      td small {
        display: block;
        font-size: 0.8rem;
      }

      .live-dot {
        border-radius: 999px;
        background: #dcfce7;
        color: #166534;
        padding: 0.25rem 0.55rem;
        font-size: 0.76rem;
        font-weight: 800;
      }

      .occupancy-panel .section-header strong {
        font-size: 1.5rem;
        color: #0d78b1;
      }

      .occupancy-track {
        height: 12px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .occupancy-track span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #16a34a, #ef780a);
      }

      .peak-bars {
        min-height: 130px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 0.5rem;
        align-items: end;
        margin-top: 1rem;
      }

      .bar-item {
        display: grid;
        gap: 0.4rem;
        justify-items: center;
      }

      .bar {
        width: 100%;
        max-width: 28px;
        border-radius: 6px 6px 0 0;
        background: var(--app-primary-action);
      }

      .method-card {
        display: flex;
        gap: 0.7rem;
      }

      .method-card i {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: #eaf4fb;
        color: #0d78b1;
      }

      .table-wrap {
        overflow: auto;
        border: 1px solid var(--app-border);
      }

      app-search-bar {
        flex: 0 1 360px;
        min-width: 260px;
      }

      table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
      }

      th,
      td {
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        padding: 0.7rem;
        text-align: left;
        font-size: 0.88rem;
        white-space: nowrap;
      }

      th:last-child,
      td:last-child {
        border-right: 0;
      }

      th {
        position: sticky;
        top: 0;
        z-index: 2;
        background: #f8fafc;
        color: #475569;
        font-size: 0.86rem;
        font-weight: 800;
      }

      .sort-header {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .sort-header i {
        margin: 0;
      }

      .column-filter-row th {
        top: 2.85rem;
        padding: 0.45rem;
        background: #ffffff;
      }

      .column-filter-control {
        display: block;
      }

      .column-filter-control input {
        padding-right: 2.35rem;
      }

      tbody tr:nth-child(even) {
        background: #f7fafc;
      }

      tbody tr:hover {
        background: #eef6fc;
      }

      .status-pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.25rem 0.55rem;
        font-size: 0.76rem;
        font-weight: 800;
      }

      .inside {
        background: #dcfce7;
        color: #166534;
      }

      .out {
        background: #e0f2fe;
        color: #075985;
      }

      .blocked {
        background: #fee2e2;
        color: #991b1b;
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        color: var(--app-text);
      }

      .pagination-card {
        min-width: 0;
      }

      .side-stack {
        display: grid;
        gap: 1rem;
        align-content: start;
      }

      .rule-card,
      .trainer-card {
        display: grid;
        gap: 0.75rem;
      }

      .rule-row,
      .trainer-row {
        display: flex;
        justify-content: space-between;
        gap: 0.7rem;
        align-items: center;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.65rem;
      }

      .rule-row {
        justify-content: flex-start;
      }

      .rule-row i {
        color: #ef780a;
      }

      .trainer-row strong {
        color: #0d78b1;
      }

      .reports-panel {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .report-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        justify-content: flex-end;
      }

      .report-tags span {
        border: 1px solid #dbe7ef;
        border-radius: 999px;
        padding: 0.35rem 0.65rem;
        background: #f8fafc;
        color: #475569;
        font-size: 0.8rem;
        font-weight: 700;
      }

      @media (max-width: 980px) {
        .attendance-hero,
        .reports-panel,
        .reception-grid,
        .content-grid {
          grid-template-columns: 1fr;
          display: grid;
        }

        .scan-actions,
        .manual-entry,
        .hero-metrics {
          grid-template-columns: 1fr;
        }

        .report-tags {
          justify-content: flex-start;
        }

        app-search-bar {
          flex-basis: auto;
          min-width: 0;
        }
      }
    `
  ]
})
export class AttendanceHomeComponent {
  private attendanceService = inject(AttendanceService);
  private memberService = inject(MemberService);

  members = this.memberService.list();
  selectedMemberId = this.members[0]?.id ?? '';
  searchTerm = '';
  lastEntry: AttendanceEntry | null = null;
  duplicateEntry = false;
  first = 0;
  rows = 10;
  sortField: AttendanceSortField = 'checkedInAt';
  sortOrder: 1 | -1 = -1;
  columnFilters: AttendanceColumnFilters = {
    memberName: '',
    checkedInAt: null,
    method: null,
    trainer: '',
    status: null
  };
  methodOptions: CheckInMethod[] = ['QR Code', 'Face Recognition', 'NFC Card', 'Biometric', 'Manual'];
  statusOptions: AttendanceEntry['status'][] = ['Inside', 'Checked Out', 'Expired Blocked'];

  checkInMethods = [
    {
      title: 'QR Code Scan',
      icon: 'pi pi-qrcode',
      copy: 'Each member uses a unique QR digital card for cheap, fast, easy entry.'
    },
    {
      title: 'Face Recognition',
      icon: 'pi pi-camera',
      copy: 'Future-ready contactless matching for fraud prevention and VIP entry.'
    },
    {
      title: 'NFC / RFID Card',
      icon: 'pi pi-credit-card',
      copy: 'Tap card access for premium gyms and controlled entry points.'
    },
    {
      title: 'Biometric',
      icon: 'pi pi-lock',
      copy: 'Fingerprint attendance for staff or high-security gym workflows.'
    }
  ];

  constructor() {
    this.attendanceService.seedToday(this.members);
  }

  get summary() {
    return this.attendanceService.getSummary(this.members.length);
  }

  get hourlyFootfall() {
    return this.attendanceService.getHourlyFootfall();
  }

  get filteredEntries(): AttendanceEntry[] {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.attendanceService.getTodaysEntries().filter((entry) => {
      const matchesSearch =
        !term ||
        [entry.memberName, entry.trainer, entry.membershipType, entry.method, entry.status]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesSearch && this.matchesColumnFilters(entry);
    });

    return filtered.sort((a, b) => this.compareEntries(a, b));
  }

  get totalEntries(): number {
    return this.filteredEntries.length;
  }

  get pagedEntries(): AttendanceEntry[] {
    return this.filteredEntries.slice(this.first, this.first + this.rows);
  }

  get showingStart(): number {
    return this.totalEntries ? this.first + 1 : 0;
  }

  get showingEnd(): number {
    return Math.min(this.first + this.rows, this.totalEntries);
  }

  get trainerAttendance(): Array<{ name: string; count: number }> {
    const counts = this.attendanceService.getTodaysEntries().reduce((acc, entry) => {
      if (entry.status === 'Inside') {
        acc[entry.trainer] = (acc[entry.trainer] || 0) + 1;
      }

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  quickScan(method: CheckInMethod): void {
    if (!this.members.length) {
      return;
    }

    const checkedInIds = new Set(this.attendanceService.getTodaysEntries().map((entry) => entry.memberId));
    const member = this.members.find((item) => !checkedInIds.has(item.id)) ?? this.members[0];
    this.checkIn(member, method);
  }

  manualCheckIn(): void {
    const member = this.members.find((item) => item.id === this.selectedMemberId);

    if (member) {
      this.checkIn(member, 'Manual');
    }
  }

  statusClass(entry: AttendanceEntry): string {
    if (entry.status === 'Expired Blocked') {
      return 'blocked';
    }

    return entry.status === 'Inside' ? 'inside' : 'out';
  }

  setSearch(term: string): void {
    this.searchTerm = term;
    this.first = 0;
  }

  onColumnFilterChange(): void {
    this.first = 0;
  }

  clearColumnFilter(field: keyof AttendanceColumnFilters): void {
    this.columnFilters[field] = null as never;

    if (field === 'memberName' || field === 'trainer') {
      this.columnFilters[field] = '' as never;
    }

    this.onColumnFilterChange();
  }

  sortBy(field: AttendanceSortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
      return;
    }

    this.sortField = field;
    this.sortOrder = field === 'checkedInAt' ? -1 : 1;
  }

  sortIcon(field: AttendanceSortField): string {
    if (this.sortField !== field) {
      return 'pi pi-sort-alt';
    }

    return this.sortOrder === 1 ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down';
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
  }

  trackByEntry(_: number, entry: AttendanceEntry): string {
    return entry.id;
  }

  private checkIn(member: Member, method: CheckInMethod): void {
    const result = this.attendanceService.markCheckIn(member, method);
    this.lastEntry = result.entry;
    this.duplicateEntry = result.duplicate;
    this.first = 0;
  }

  private matchesColumnFilters(entry: AttendanceEntry): boolean {
    const filterDate = this.columnFilters.checkedInAt;
    const checkedInDate = new Date(entry.checkedInAt);

    return (
      this.includes(entry.memberName, this.columnFilters.memberName) &&
      (!filterDate || checkedInDate.toDateString() === filterDate.toDateString()) &&
      (!this.columnFilters.method || entry.method === this.columnFilters.method) &&
      this.includes(entry.trainer, this.columnFilters.trainer) &&
      (!this.columnFilters.status || entry.status === this.columnFilters.status)
    );
  }

  private compareEntries(a: AttendanceEntry, b: AttendanceEntry): number {
    const aValue = this.sortField === 'checkedInAt' ? new Date(a.checkedInAt).getTime() : String(a[this.sortField]).toLowerCase();
    const bValue = this.sortField === 'checkedInAt' ? new Date(b.checkedInAt).getTime() : String(b[this.sortField]).toLowerCase();

    if (aValue < bValue) {
      return -1 * this.sortOrder;
    }

    if (aValue > bValue) {
      return 1 * this.sortOrder;
    }

    return 0;
  }

  private includes(value: string, filter: string): boolean {
    return !filter || value.toLowerCase().includes(filter.trim().toLowerCase());
  }
}
