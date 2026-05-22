import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { MemberService } from '../../../../core/services/member.service';
import { PaymentService } from '../../../../core/services/payment.service';

interface RiskMember {
  name: string;
  plan: string;
  risk: number;
  reason: string;
  action: string;
}

interface PredictionCard {
  title: string;
  value: string;
  note: string;
  icon: string;
  tone: 'blue' | 'green' | 'orange' | 'red';
}

@Component({
  selector: 'app-ai-insights-home',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="ai-page">
      <section class="ai-hero">
        <div>
          <span class="eyebrow">AI Insights Premium</span>
          <h2>AI Insights</h2>
          <p>Predict dropout risk, revenue growth, peak crowd hours, and renewal probability before problems become visible.</p>
        </div>
        <div class="premium-badge">
          <i class="pi pi-sparkles"></i>
          Premium
        </div>
      </section>

      <section class="prediction-grid">
        <article *ngFor="let card of predictionCards" class="prediction-card" [ngClass]="card.tone">
          <i [class]="card.icon"></i>
          <span>{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.note }}</small>
        </article>
      </section>

      <section class="dashboard-grid">
        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Revenue Forecast</h3>
              <p>AI projection based on collections, renewals, and seasonal campaign momentum.</p>
            </div>
            <span>{{ forecastGrowthLabel }}</span>
          </div>
          <p-chart type="line" [data]="revenueForecastChart" [options]="chartOptions"></p-chart>
        </div>

        <div class="page-card chart-panel">
          <div class="section-heading">
            <div>
              <h3>Peak Hours Prediction</h3>
              <p>Expected crowd pressure by hour, useful for staffing and floor planning.</p>
            </div>
            <span>{{ attendanceSummary.peakTime }}</span>
          </div>
          <p-chart type="bar" [data]="peakHourChart" [options]="chartOptions"></p-chart>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="page-card risk-panel">
          <div class="section-heading">
            <div>
              <h3>Member Dropout Risk</h3>
              <p>Members who need retention action from reception, trainers, or offers.</p>
            </div>
          </div>

          <div class="risk-list">
            <article *ngFor="let member of riskMembers" class="risk-row">
              <div>
                <strong>{{ member.name }}</strong>
                <span>{{ member.plan }} | {{ member.reason }}</span>
              </div>
              <div class="risk-meter">
                <span><em [style.width.%]="member.risk"></em></span>
                <small>{{ member.risk }}% risk</small>
              </div>
              <button type="button">{{ member.action }}</button>
            </article>
            <div *ngIf="!riskMembers.length" class="empty-state">
              No dropout risk found from current member records.
            </div>
          </div>
        </div>

        <div class="page-card renewal-panel">
          <div class="section-heading">
            <div>
              <h3>Renewal Predictions</h3>
              <p>Expected renewals, likely misses, and recommended retention offers.</p>
            </div>
          </div>

          <div class="renewal-ring">
            <strong>{{ renewalProbability }}%</strong>
            <span>Predicted renewal probability</span>
          </div>

          <div class="recommendation-list">
            <div *ngFor="let item of renewalRecommendations">
              <i [class]="item.icon"></i>
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.copy }}</span>
              </div>
            </div>
            <div *ngIf="!renewalRecommendations.length" class="empty-state">
              No AI recommendations available until member, payment, and attendance records are added.
            </div>
          </div>
        </div>
      </section>

      <section class="page-card insight-strip">
        <div>
          <h3>AI Action Plan</h3>
          <p>{{ actionPlanText }}</p>
        </div>
        <button type="button" [disabled]="!renewalRecommendations.length"><i class="pi pi-send"></i> Send to Notifications</button>
      </section>
    </div>
  `,
  styles: [
    `
      .ai-page {
        display: grid;
        gap: 1rem;
      }

      .ai-hero,
      .insight-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .ai-hero {
        padding: 1.35rem;
        border-radius: 12px;
        color: #fff;
        background: var(--app-hero);
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      .ai-hero p {
        color: rgba(255, 255, 255, 0.88);
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .premium-badge {
        display: flex;
        gap: 0.45rem;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 999px;
        padding: 0.55rem 0.85rem;
        background: rgba(255, 255, 255, 0.14);
        font-weight: 900;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      button i {
        margin-right: 0.35rem;
      }

      .prediction-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 0.85rem;
      }

      .prediction-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .prediction-card i {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        margin-bottom: 0.7rem;
      }

      .prediction-card span,
      .section-heading p,
      .risk-row span,
      .renewal-ring span,
      .recommendation-list span,
      .insight-strip p,
      small {
        color: #64748b;
      }

      .prediction-card span {
        display: block;
        font-size: 0.84rem;
        font-weight: 800;
      }

      .prediction-card strong {
        display: block;
        margin: 0.25rem 0;
        font-size: 1.7rem;
      }

      .blue i,
      .blue strong {
        background: #eaf4fb;
        color: #0d78b1;
      }

      .green i,
      .green strong {
        background: #dcfce7;
        color: #166534;
      }

      .orange i,
      .orange strong {
        background: #ffedd5;
        color: #9a3412;
      }

      .red i,
      .red strong {
        background: #fee2e2;
        color: #991b1b;
      }

      .dashboard-grid {
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
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .section-heading span {
        border-radius: 999px;
        background: #eaf4fb;
        color: #0d78b1;
        padding: 0.3rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .risk-list,
      .recommendation-list {
        display: grid;
        gap: 0.75rem;
      }

      .risk-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 150px auto;
        gap: 0.75rem;
        align-items: center;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }

      .risk-row span,
      .recommendation-list span {
        display: block;
        margin-top: 0.16rem;
      }

      .risk-meter {
        display: grid;
        gap: 0.25rem;
      }

      .risk-meter span {
        height: 8px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .risk-meter em {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #ef780a, #dc2626);
      }

      .renewal-panel {
        display: grid;
        gap: 1rem;
      }

      .renewal-ring {
        width: 170px;
        height: 170px;
        margin: 0 auto;
        border-radius: 50%;
        display: grid;
        place-content: center;
        text-align: center;
        border: 16px solid #d9edf8;
        box-shadow: inset 0 0 0 10px #fff7ed;
      }

      .renewal-ring strong {
        font-size: 2.15rem;
        color: #0d78b1;
      }

      .recommendation-list div {
        display: flex;
        gap: 0.7rem;
        align-items: flex-start;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }

      .recommendation-list i {
        color: #ef780a;
      }

      .empty-state {
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        padding: 1rem;
        color: #64748b;
        background: #f8fafc;
        font-weight: 700;
      }

      .insight-strip button {
        background: var(--app-secondary-action);
      }

      @media (max-width: 980px) {
        .ai-hero,
        .insight-strip,
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .risk-row {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AiInsightsHomeComponent {
  private attendanceService = inject(AttendanceService);
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);

  members = this.memberService.list();
  payments = this.paymentService.list();
  attendanceSummary = this.attendanceService.getSummary(this.members.length);
  revenueForecastChart = this.buildRevenueForecastChart();
  peakHourChart = this.buildPeakHourChart();

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#475569' } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#eef2f7' } }
    }
  };

  get completedRevenue(): number {
    return this.payments
      .filter((payment) => payment.status === 'Completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  get renewalProbability(): number {
    const activeMembers = this.members.filter((member) => member.active).length;
    return this.members.length ? Math.round((activeMembers / this.members.length) * 100) : 0;
  }

  get forecastGrowthLabel(): string {
    const current = this.monthRevenue(0);
    const next = this.projectedNextMonthRevenue;
    const growth = current > 0 ? Math.round(((next - current) / current) * 100) : 0;
    return `${growth >= 0 ? '+' : ''}${growth}% next month`;
  }

  get predictionCards(): PredictionCard[] {
    return [
      {
        title: 'Dropout Risk',
        value: `${this.riskMembers.length} members`,
        note: 'Need retention follow-up',
        icon: 'pi pi-exclamation-triangle',
        tone: 'red'
      },
      {
        title: 'Revenue Forecast',
        value: `Rs. ${Math.round(this.projectedNextMonthRevenue).toLocaleString('en-IN')}`,
        note: `${this.forecastGrowthLabel} from current records`,
        icon: 'pi pi-chart-line',
        tone: 'green'
      },
      {
        title: 'Peak Hours',
        value: this.attendanceSummary.peakTime,
        note: 'Expected highest crowd window',
        icon: 'pi pi-clock',
        tone: 'orange'
      },
      {
        title: 'Renewal Prediction',
        value: `${this.renewalProbability}%`,
        note: 'Likely renewal probability',
        icon: 'pi pi-refresh',
        tone: 'blue'
      }
    ];
  }

  get riskMembers(): RiskMember[] {
    return this.members
      .map((member) => {
        const daysRemaining = this.daysUntilExpiry(member);
        const history = this.attendanceService.getMemberHistory(member.id);
        const risk = this.calculateRisk(member.active, daysRemaining, history.length);

        return {
          name: member.fullName || `${member.firstName} ${member.lastName}`.trim(),
          plan: member.planName || 'General',
          risk,
          reason: this.riskReason(member.active, daysRemaining, history.length),
          action: this.riskAction(member.active, daysRemaining, history.length)
        };
      })
      .filter((member) => member.risk > 0)
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);
  }

  get renewalRecommendations() {
    const recommendations: Array<{ title: string; copy: string; icon: string }> = [];
    const expiringSoon = this.membersExpiringWithin(7).length;
    const inactiveMembers = this.members.filter((member) => !member.active).length;
    const pendingPayments = this.payments.filter((payment) => payment.status === 'Pending').length;

    if (expiringSoon) {
      recommendations.push({
        title: 'Send Renewal Reminder',
        copy: `${expiringSoon} member${expiringSoon === 1 ? '' : 's'} expire within 7 days.`,
        icon: 'pi pi-bell'
      });
    }

    if (inactiveMembers) {
      recommendations.push({
        title: 'Follow Up Inactive Members',
        copy: `${inactiveMembers} inactive member${inactiveMembers === 1 ? '' : 's'} need a retention call.`,
        icon: 'pi pi-ticket'
      });
    }

    if (pendingPayments) {
      recommendations.push({
        title: 'Collect Pending Payments',
        copy: `${pendingPayments} pending invoice${pendingPayments === 1 ? '' : 's'} are open.`,
        icon: 'pi pi-wallet'
      });
    }

    if (this.attendanceSummary.peakTime !== '-') {
      recommendations.push({
        title: 'Optimize Trainer Allocation',
        copy: `Schedule staff for the ${this.attendanceSummary.peakTime} crowd window.`,
        icon: 'pi pi-users'
      });
    }

    return recommendations;
  }

  get actionPlanText(): string {
    if (!this.members.length && !this.payments.length && !this.attendanceService.list().length) {
      return 'Add member, payment, and attendance records to generate AI action plans.';
    }

    if (!this.renewalRecommendations.length) {
      return 'Current records do not show urgent retention, renewal, payment, or attendance actions.';
    }

    return this.renewalRecommendations.map((item) => item.title).join(', ') + '.';
  }

  private buildRevenueForecastChart() {
    const labels = ['This Month', 'Next Month', 'Month +2', 'Month +3'];
    const current = this.monthRevenue(0);
    const projected = this.projectedNextMonthRevenue;
    const expiringNextMonth = this.membersExpiringWithin(30).length;
    const monthlyLift = expiringNextMonth ? this.averagePaymentAmount : 0;

    return {
      labels,
      datasets: [
        {
          label: 'Forecast Revenue',
          data: [current, projected, projected + monthlyLift, projected + monthlyLift * 2],
          borderColor: '#0d78b1',
          backgroundColor: 'rgba(13, 120, 177, 0.14)',
          tension: 0.35,
          fill: true
        }
      ]
    };
  }

  private buildPeakHourChart() {
    const footfall = this.attendanceService.getHourlyFootfall();

    return {
      labels: footfall.map((item) => item.hour),
      datasets: [
        {
          label: 'Predicted Footfall',
          data: footfall.map((item) => item.count),
          backgroundColor: '#0d78b1',
          borderRadius: 6
        }
      ]
    };
  }

  private get projectedNextMonthRevenue(): number {
    if (!this.payments.length) {
      return 0;
    }

    const currentMonthRevenue = this.monthRevenue(0);
    const expiringSoonRevenue = this.membersExpiringWithin(30).length * this.averagePaymentAmount;
    return Math.round(currentMonthRevenue + expiringSoonRevenue);
  }

  private get averagePaymentAmount(): number {
    const completed = this.payments.filter((payment) => payment.status === 'Completed');
    if (!completed.length) {
      return 0;
    }

    return completed.reduce((sum, payment) => sum + payment.amount, 0) / completed.length;
  }

  private monthRevenue(offset: number): number {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    const month = date.getMonth();
    const year = date.getFullYear();

    return this.payments
      .filter((payment) => {
        const paidAt = new Date(payment.paidAt);
        return payment.status === 'Completed' && paidAt.getMonth() === month && paidAt.getFullYear() === year;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  private membersExpiringWithin(days: number) {
    return this.members.filter((member) => {
      const remaining = this.daysUntilExpiry(member);
      return member.active && remaining >= 0 && remaining <= days;
    });
  }

  private daysUntilExpiry(member: { startDate: string; duration: number }): number {
    const startDate = new Date(member.startDate);
    if (Number.isNaN(startDate.getTime()) || !member.duration) {
      return Number.MAX_SAFE_INTEGER;
    }

    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + member.duration);
    return Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000);
  }

  private calculateRisk(active: boolean, daysRemaining: number, visitCount: number): number {
    if (!active || daysRemaining < 0) {
      return 90;
    }

    if (daysRemaining <= 7) {
      return 75;
    }

    if (daysRemaining <= 30) {
      return 55;
    }

    if (visitCount === 0 && this.attendanceService.list().length) {
      return 45;
    }

    return 0;
  }

  private riskReason(active: boolean, daysRemaining: number, visitCount: number): string {
    if (!active) {
      return 'Inactive membership';
    }

    if (daysRemaining < 0) {
      return `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`;
    }

    if (daysRemaining <= 30) {
      return `Renewal due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
    }

    if (visitCount === 0) {
      return 'No attendance activity';
    }

    return 'Low engagement';
  }

  private riskAction(active: boolean, daysRemaining: number, visitCount: number): string {
    if (!active || daysRemaining < 0) {
      return 'Call';
    }

    if (daysRemaining <= 30) {
      return 'Send Offer';
    }

    if (visitCount === 0) {
      return 'Trainer Follow-up';
    }

    return 'Follow-up';
  }
}
