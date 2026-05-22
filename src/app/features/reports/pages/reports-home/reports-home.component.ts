import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { EnquiryService } from '../../../../core/services/enquiry.service';
import { MemberService } from '../../../../core/services/member.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { PlanService } from '../../../../core/services/plan.service';
import { TrainerService } from '../../../../core/services/trainer.service';

interface ReportKpi {
  label: string;
  value: string | number;
  note: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange' | 'red';
}

interface ReportSection {
  title: string;
  icon: string;
  metrics: string[];
  insight: string;
}

@Component({
  selector: 'app-reports-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule],
  template: `
    <div class="reports-page">
      <section class="reports-hero">
        <div>
          <span class="eyebrow">Business Intelligence</span>
          <h2>Gym Management Reports</h2>
          <p>Real-time insights for revenue, memberships, attendance, payments, leads, trainer output, and retention.</p>
        </div>
        <div class="hero-actions">
          <button type="button"><i class="pi pi-file-pdf"></i> PDF</button>
          <button type="button"><i class="pi pi-file-excel"></i> Excel</button>
          <button type="button" class="secondary"><i class="pi pi-send"></i> Share</button>
        </div>
      </section>

      <section class="filter-bar page-card">
        <label>
          Date Range
          <select [(ngModel)]="dateRange">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </label>
        <label>
          Trainer
          <select [(ngModel)]="trainer">
            <option>All Trainers</option>
            <option *ngFor="let item of trainers">{{ item.fullName }}</option>
          </select>
        </label>
        <label>
          Plan
          <select [(ngModel)]="plan">
            <option>All Plans</option>
            <option *ngFor="let item of plans">{{ item.name }}</option>
          </select>
        </label>
      </section>

      <section class="kpi-grid">
        <article *ngFor="let item of kpis" class="kpi-card" [ngClass]="item.tone">
          <i [class]="item.icon"></i>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <section class="dashboard-grid">
        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Revenue Reports</h3>
              <p>Daily, weekly, monthly, yearly, and trainer-wise earnings.</p>
            </div>
            <span>+18% forecast</span>
          </div>
          <p-chart type="bar" [data]="revenueChart" [options]="chartOptions"></p-chart>
        </div>

        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Membership Mix</h3>
              <p>New members, renewals, expired plans, cancelled plans, and popular packages.</p>
            </div>
            <span>{{ mostPopularPlan }}</span>
          </div>
          <p-chart type="doughnut" [data]="membershipChart" [options]="doughnutOptions"></p-chart>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Attendance Reports</h3>
              <p>Daily usage, repeat visitors, inactive members, occupancy, and peak hours.</p>
            </div>
            <span>{{ attendanceSummary.peakTime }}</span>
          </div>
          <p-chart type="line" [data]="attendanceChart" [options]="chartOptions"></p-chart>
        </div>

        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Payment Methods</h3>
              <p>Successful payments, pending dues, failed transactions, refunds, and method usage.</p>
            </div>
            <span>UPI 72%</span>
          </div>
          <p-chart type="pie" [data]="paymentChart" [options]="doughnutOptions"></p-chart>
        </div>
      </section>

      <section class="insight-grid">
        <article class="page-card ai-panel">
          <div class="section-heading">
            <div>
              <h3>AI-Powered Smart Reports</h3>
              <p>Predictive alerts for churn, revenue growth, marketing timing, and trainer allocation.</p>
            </div>
            <i class="pi pi-sparkles"></i>
          </div>
          <div class="ai-list">
            <div *ngFor="let insight of aiInsights">
              <strong>{{ insight.title }}</strong>
              <span>{{ insight.copy }}</span>
            </div>
          </div>
        </article>

        <article class="page-card retention-panel">
          <h3>Inactive Member Reports</h3>
          <div class="retention-row" *ngFor="let item of inactiveBuckets">
            <span>{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
            <button type="button">{{ item.action }}</button>
          </div>
        </article>
      </section>

      <section class="reports-navigation">
        <article *ngFor="let section of reportSections" class="report-card">
          <i [class]="section.icon"></i>
          <h4>{{ section.title }}</h4>
          <ul>
            <li *ngFor="let metric of section.metrics">{{ metric }}</li>
          </ul>
          <p>{{ section.insight }}</p>
        </article>
      </section>

      <section class="dashboard-grid">
        <div class="page-card table-panel">
          <div class="section-heading">
            <div>
              <h3>Trainer Performance</h3>
              <p>Sessions, assigned members, PT revenue, ratings, and attendance ratio.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Members</th>
                <th>Sessions</th>
                <th>PT Revenue</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of trainerRows">
                <td>{{ item.name }}</td>
                <td>{{ item.members }}</td>
                <td>{{ item.sessions }}</td>
                <td>Rs. {{ item.revenue }}</td>
                <td>{{ item.rating }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="page-card export-center">
        <div>
          <h3>Export Center</h3>
          <p>PDF, Excel, CSV, email report, WhatsApp share, and scheduled daily or weekly auto reports.</p>
        </div>
        <div class="export-actions">
          <button type="button"><i class="pi pi-download"></i> CSV</button>
          <button type="button"><i class="pi pi-envelope"></i> Email</button>
          <button type="button" class="secondary"><i class="pi pi-whatsapp"></i> WhatsApp</button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .reports-page {
        display: grid;
        gap: 1rem;
      }

      .reports-hero,
      .export-center {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
      }

      .reports-hero {
        padding: 1.35rem;
        border-radius: 12px;
        background: var(--app-hero);
        color: #fff;
      }

      h2,
      h3,
      h4,
      p {
        margin: 0;
      }

      .reports-hero p,
      .hero-actions button.secondary {
        color: rgba(255, 255, 255, 0.88);
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .hero-actions,
      .export-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.65rem 0.8rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      .reports-hero button {
        background: rgba(255, 255, 255, 0.18);
      }

      button.secondary {
        background: var(--app-secondary-action);
      }

      button i {
        margin-right: 0.35rem;
      }

      .filter-bar {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: #475569;
        font-size: 0.8rem;
        font-weight: 800;
      }

      select {
        width: 100%;
        border: 1px solid #d2dce8;
        border-radius: 8px;
        padding: 0.65rem 0.75rem;
        font: inherit;
        color: #1f2937;
        background: #fff;
      }

      .kpi-grid,
      .reports-navigation {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        gap: 0.85rem;
      }

      .kpi-card,
      .report-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .kpi-card i {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        margin-bottom: 0.75rem;
      }

      .kpi-card span,
      small,
      .section-heading p,
      .report-card p,
      .ai-list span,
      .export-center p {
        color: #64748b;
      }

      .kpi-card strong {
        display: block;
        margin: 0.2rem 0;
        font-size: 1.65rem;
      }

      .blue i,
      .blue strong {
        color: #0d78b1;
        background: #eaf4fb;
      }

      .green i,
      .green strong {
        color: #15803d;
        background: #dcfce7;
      }

      .orange i,
      .orange strong {
        color: #d96500;
        background: #ffedd5;
      }

      .red i,
      .red strong {
        color: #b91c1c;
        background: #fee2e2;
      }

      .dashboard-grid,
      .insight-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .chart-panel {
        min-height: 365px;
      }

      .chart-panel p-chart {
        display: block;
        height: 285px;
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: flex-start;
      }

      .section-heading span {
        flex: 0 0 auto;
        border-radius: 999px;
        background: #eaf4fb;
        color: #0d78b1;
        padding: 0.3rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .ai-panel .section-heading i {
        color: #ef780a;
        font-size: 1.4rem;
      }

      .ai-list,
      .retention-panel {
        display: grid;
        gap: 0.75rem;
      }

      .ai-list div,
      .retention-row {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }

      .ai-list span {
        display: block;
        margin-top: 0.2rem;
      }

      .retention-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .retention-row button {
        padding: 0.42rem 0.6rem;
        font-size: 0.78rem;
      }

      .report-card i {
        color: #0d78b1;
        font-size: 1.15rem;
      }

      .report-card h4 {
        margin-top: 0.45rem;
      }

      .report-card ul {
        margin: 0.65rem 0;
        padding-left: 1rem;
        color: #475569;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        border-bottom: 1px solid #e2e8f0;
        padding: 0.7rem;
        text-align: left;
        font-size: 0.88rem;
      }

      th {
        background: #f8fafc;
        color: #475569;
        font-size: 0.78rem;
      }

      @media (max-width: 980px) {
        .reports-hero,
        .export-center,
        .dashboard-grid,
        .insight-grid,
        .filter-bar {
          grid-template-columns: 1fr;
          display: grid;
        }

        .hero-actions,
        .export-actions {
          justify-content: flex-start;
        }

        table {
          min-width: 560px;
        }

        .table-panel {
          overflow-x: auto;
        }
      }
    `
  ]
})
export class ReportsHomeComponent {
  private attendanceService = inject(AttendanceService);
  private enquiryService = inject(EnquiryService);
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);
  private planService = inject(PlanService);
  private trainerService = inject(TrainerService);

  members = this.memberService.list();
  payments = this.paymentService.list();
  plans = this.planService.list();
  trainers = this.trainerService.list();
  attendanceSummary = this.attendanceService.getSummary(this.members.length);

  dateRange = 'This Month';
  trainer = 'All Trainers';
  plan = 'All Plans';

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#475569' } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#eef2f7' } }
    }
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#475569' } } }
  };

  get todaysRevenue(): number {
    const today = new Date().toISOString().slice(0, 10);
    const total = this.payments
      .filter((payment) => payment.status === 'Completed' && payment.paidAt.startsWith(today))
      .reduce((sum, payment) => sum + payment.amount, 0);

    return total;
  }

  get pendingDues(): number {
    const total = this.payments
      .filter((payment) => payment.status === 'Pending')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return total;
  }

  get activeMembers(): number {
    return this.members.filter((member) => member.active).length;
  }

  get mostPopularPlan(): string {
    const counts = this.members.reduce((acc, member) => {
      acc[member.planName] = (acc[member.planName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || '-';
  }

  get kpis(): ReportKpi[] {
    return [
      { label: 'Total Members', value: this.members.length, note: 'Total registered members', icon: 'pi pi-users', tone: 'blue' },
      { label: 'Active Memberships', value: this.activeMembers, note: 'Memberships currently valid', icon: 'pi pi-id-card', tone: 'green' },
      { label: "Today's Revenue", value: `Rs. ${this.todaysRevenue.toLocaleString('en-IN')}`, note: 'Payments collected today', icon: 'pi pi-wallet', tone: 'orange' },
      { label: 'Pending Dues', value: `Rs. ${this.pendingDues.toLocaleString('en-IN')}`, note: 'Follow-up required', icon: 'pi pi-clock', tone: 'red' },
      { label: 'Gym Occupancy', value: `${this.attendanceSummary.occupancyPercent}%`, note: `${this.attendanceSummary.insideGym} members inside`, icon: 'pi pi-chart-line', tone: 'blue' },
      { label: 'New Registrations', value: this.enquiryService.list().filter((item) => item.status === 'Converted').length, note: 'Converted leads this period', icon: 'pi pi-user-plus', tone: 'green' }
    ];
  }

  get revenueChart() {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return date;
    });

    return {
      labels: months.map((date) => date.toLocaleString('en-US', { month: 'short' })),
      datasets: [
        {
          label: 'Revenue',
          data: months.map((month) => this.sumPaymentsForMonth(month)),
          backgroundColor: '#0d78b1',
          borderRadius: 6
        },
        {
          label: 'PT Revenue',
          data: months.map((month) => this.sumPaymentsForMonth(month, true)),
          backgroundColor: '#ef780a',
          borderRadius: 6
        }
      ]
    };
  }

  get membershipChart() {
    const newMembers = this.members.filter((member) => this.isCurrentMonth(member.startDate)).length;
    const renewals = this.payments.filter((payment) => payment.status === 'Completed' && !this.isCurrentMonth(payment.paidAt)).length;
    const expired = this.members.filter((member) => !member.active).length;

    return {
      labels: ['New Members', 'Renewals', 'Expired'],
      datasets: [
        {
          data: [newMembers, renewals, expired],
          backgroundColor: ['#0d78b1', '#16a34a', '#ef780a']
        }
      ]
    };
  }

  get attendanceChart() {
    const footfall = this.attendanceService.getHourlyFootfall();

    return {
      labels: footfall.map((item) => item.hour),
      datasets: [
        {
          label: 'Hourly Footfall',
          data: footfall.map((item) => item.count),
          borderColor: '#0d78b1',
          backgroundColor: 'rgba(13, 120, 177, 0.16)',
          tension: 0.35,
          fill: true
        }
      ]
    };
  }

  get paymentChart() {
    const byMethod = this.payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(byMethod),
      datasets: [{ data: Object.values(byMethod), backgroundColor: ['#0d78b1', '#ef780a', '#16a34a', '#dc2626', '#8b5cf6'] }]
    };
  }

  get aiInsights() {
    return [
      this.pendingDues ? { title: 'Payment Follow-up', copy: `Pending dues total Rs. ${this.pendingDues.toLocaleString('en-IN')}.` } : null,
      this.members.length - this.activeMembers
        ? { title: 'Inactive Members', copy: `${this.members.length - this.activeMembers} inactive members need attention.` }
        : null,
      this.attendanceSummary.peakTime !== '-' ? { title: 'Peak Crowd Time', copy: `Current peak window: ${this.attendanceSummary.peakTime}.` } : null
    ].filter((item): item is { title: string; copy: string } => !!item);
  }

  get inactiveBuckets() {
    const inactive = this.members.filter((member) => !member.active).length;
    return inactive ? [{ label: 'Inactive Members', count: inactive, action: 'Follow Up' }] : [];
  }

  reportSections: ReportSection[] = [
    { title: 'Revenue', icon: 'pi pi-chart-bar', metrics: ['Daily revenue', 'Monthly revenue', 'Trainer revenue'], insight: 'Track earnings by time and trainer.' },
    { title: 'Membership', icon: 'pi pi-id-card', metrics: ['New members', 'Renewals', 'Expired plans'], insight: `Most sold plan: ${this.mostPopularPlan}.` },
    { title: 'Attendance', icon: 'pi pi-check-square', metrics: ['Peak hours', 'Repeat visitors', 'Occupancy'], insight: 'Find crowd patterns and missed sessions.' },
    { title: 'Payments', icon: 'pi pi-credit-card', metrics: ['Pending dues', 'Failed transactions', 'Refunds'], insight: 'Spot payment issues before month end.' },
    { title: 'Inventory', icon: 'pi pi-box', metrics: ['Protein stock', 'Equipment maintenance', 'Low alerts'], insight: 'Keep supplements and equipment ready.' },
    { title: 'Leads', icon: 'pi pi-envelope', metrics: ['Walk-ins', 'Website leads', 'Conversion ratio'], insight: 'Measure enquiry to member conversion.' },
    { title: 'AI Insights', icon: 'pi pi-sparkles', metrics: ['Churn risk', 'Best offers', 'Peak seasons'], insight: 'Predict and act before revenue drops.' }
  ];

  get trainerRows() {
    const attendance = this.attendanceService.getTodaysEntries();

    return this.trainers.map((trainer) => ({
      name: trainer.fullName,
      members: this.members.filter((member) => member.trainer === trainer.fullName).length,
      sessions: attendance.filter((entry) => entry.trainer === trainer.fullName).length,
      revenue: '0',
      rating: '-'
    }));
  }

  private sumPaymentsForMonth(month: Date, ptOnly = false): number {
    return this.payments
      .filter((payment) => {
        const paidAt = new Date(payment.paidAt);
        const sameMonth = paidAt.getMonth() === month.getMonth() && paidAt.getFullYear() === month.getFullYear();
        const matchesPlan = !ptOnly || payment.plan.toLowerCase().includes('pt');
        return payment.status === 'Completed' && sameMonth && matchesPlan;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  private isCurrentMonth(value: string): boolean {
    const date = new Date(value);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }
}
