import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';

interface DashboardWidget {
  id: string;
  label: string;
  permission?: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartModule, SearchBarComponent, TableToolbarComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);

  summary = this.dashboardService.getSummary();
  revenue = this.dashboardService.getRevenueChart();
  recentPayments = this.dashboardService.getRecentPayments();
  paymentSearchTerm = '';
  chartOptions = { responsive: true, maintainAspectRatio: false };
  currentUser = this.auth.currentUser();
  quickActions = [
    { label: 'Add Member', note: 'Create new admission', icon: 'pi pi-user-plus', route: '/members/add' },
    { label: 'Create Enquiry', note: 'Capture new lead', icon: 'pi pi-comments', route: '/enquiries/create' },
    { label: 'Record Payment', note: 'Collect dues', icon: 'pi pi-wallet', route: '/payments/add' },
    { label: 'Mark Attendance', note: 'Open check-ins', icon: 'pi pi-qrcode', route: '/attendance' }
  ];
  widgets: DashboardWidget[] = [
    { id: 'heroMetrics', label: 'Top Metrics' },
    { id: 'summaryStats', label: 'Summary Stats' },
    { id: 'revenueChart', label: 'Revenue Chart', permission: 'Payments' },
    { id: 'liveAttendance', label: 'Live Attendance', permission: 'Attendance' },
    { id: 'recentPayments', label: 'Recent Payments', permission: 'Payments' }
  ];
  selectedWidgetIds = this.initialWidgetIds();

  get filteredRecentPayments() {
    const term = this.paymentSearchTerm.trim().toLowerCase();
    return this.recentPayments.filter((payment) => {
      return (
        !term ||
        [payment.member, payment.plan, payment.amount, payment.date, payment.status]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    });
  }

  get focusCards() {
    return [
      { label: 'Renewals Due', value: this.summary.expiringSoon, note: 'Next 30 days', icon: 'pi pi-refresh', tone: 'orange' },
      {
        label: 'Pending Payments',
        value: `Rs. ${this.summary.pendingPaymentAmount.toLocaleString('en-IN')}`,
        note: `${this.summary.pendingPaymentCount} invoices open`,
        icon: 'pi pi-credit-card',
        tone: 'red'
      },
      { label: 'Trial Members', value: this.summary.trialMembers, note: 'Active one-month plans', icon: 'pi pi-id-card', tone: 'blue' },
      { label: 'PT Sessions', value: this.summary.ptSessionPayments, note: 'PT payment records', icon: 'pi pi-calendar-clock', tone: 'green' }
    ];
  }

  get operations() {
    return [
      { label: 'Occupancy', value: `${this.summary.occupancyPercent}%`, note: 'Current capacity', tone: 'green' },
      { label: 'Active Members', value: this.summary.activeMembers, note: 'Currently valid', tone: 'blue' },
      { label: 'Trainer Load', value: `${this.trainerUtilization}%`, note: 'Active trainers', tone: 'orange' }
    ];
  }

  get criticalAlerts() {
    return [
      this.summary.expiringSoon
        ? { label: `${this.summary.expiringSoon} memberships expiring soon`, icon: 'pi pi-exclamation-triangle', tone: 'orange' }
        : null,
      this.summary.pendingPaymentCount
        ? { label: `${this.summary.pendingPaymentCount} pending payments`, icon: 'pi pi-wallet', tone: 'red' }
        : null
    ].filter((alert): alert is { label: string; icon: string; tone: string } => !!alert);
  }

  get miniAnalytics() {
    return [
      { label: 'Revenue Growth', value: `${this.revenueGrowthPercent}%`, tone: this.revenueGrowthPercent >= 0 ? 'green' : 'red' },
      { label: 'Member Retention', value: `${this.summary.retentionPercent}%`, tone: 'blue' },
      { label: 'Trainer Utilization', value: `${this.trainerUtilization}%`, tone: 'orange' }
    ];
  }

  get todayTasks() {
    return [
      this.summary.expiringSoon ? `Call ${this.summary.expiringSoon} expiring members` : '',
      this.summary.pendingPaymentCount ? `Follow up ${this.summary.pendingPaymentCount} pending payments` : '',
      this.summary.totalEnquiries ? `Review ${this.summary.totalEnquiries} enquiries` : ''
    ].filter(Boolean);
  }

  get expiryFunnel() {
    const month = this.summary.expiringSoon;
    const week = Math.min(month, Math.ceil(month / 2));
    const today = Math.min(week, Math.ceil(week / 2));
    const max = Math.max(month, 1);

    return [
      { label: 'Today', value: today, width: `${Math.round((today / max) * 100)}%` },
      { label: 'This Week', value: week, width: `${Math.round((week / max) * 100)}%` },
      { label: 'This Month', value: month, width: `${Math.round((month / max) * 100)}%` }
    ];
  }

  get heatmap() {
    const values = this.dashboardService.getHourlyFootfall().map((item) => Math.min(100, item.count * 20));

    return [{ day: 'Today', bars: values }];
  }

  get aiInsights() {
    return [
      this.summary.activeMembers < this.summary.totalMembers
        ? {
            title: 'Inactive Members',
            text: `${this.summary.totalMembers - this.summary.activeMembers} inactive members need follow-up.`,
            action: 'Create Offer'
          }
        : null,
      this.summary.totalEnquiries
        ? { title: 'Lead Follow-up', text: `${this.summary.totalEnquiries} enquiries are available for review.`, action: 'View Leads' }
        : null,
      this.summary.expiringSoon
        ? { title: 'Renewal Priority', text: `${this.summary.expiringSoon} memberships are nearing expiry.`, action: 'Apply Rule' }
        : null
    ].filter((insight): insight is { title: string; text: string; action: string } => !!insight);
  }

  get todaySchedule(): Array<{ time: string; title: string; trainer: string }> {
    return [];
  }

  get trainerUtilization(): number {
    return this.summary.trainerCount ? Math.round((this.summary.activeTrainerCount / this.summary.trainerCount) * 100) : 0;
  }

  get revenueGrowthPercent(): number {
    const values = this.revenue.datasets[0]?.data ?? [];
    const current = Number(values[values.length - 1]) || 0;
    const previous = Number(values[values.length - 2]) || 0;

    if (!previous) {
      return current ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  get allowedWidgets(): DashboardWidget[] {
    return this.widgets.filter((widget) => !widget.permission || this.auth.canAccessPermission(widget.permission));
  }

  isWidgetVisible(widgetId: string): boolean {
    return this.selectedWidgetIds.includes(widgetId);
  }

  toggleWidget(widgetId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedWidgetIds = checked
      ? Array.from(new Set([...this.selectedWidgetIds, widgetId]))
      : this.selectedWidgetIds.filter((id) => id !== widgetId);
    this.auth.saveDashboardWidgetIds(this.selectedWidgetIds);
  }

  private initialWidgetIds(): string[] {
    const allowedIds = this.widgets
      .filter((widget) => !widget.permission || this.auth.canAccessPermission(widget.permission))
      .map((widget) => widget.id);
    const storedIds = this.auth.dashboardWidgetIds().filter((id) => allowedIds.includes(id));
    return storedIds.length ? storedIds : allowedIds;
  }
}
