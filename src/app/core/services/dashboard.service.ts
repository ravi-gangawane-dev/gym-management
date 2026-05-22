import { Injectable, inject } from '@angular/core';
import { AttendanceService } from './attendance.service';
import { EnquiryService } from './enquiry.service';
import { MemberService } from './member.service';
import { PaymentService } from './payment.service';
import { PlanService } from './plan.service';
import { TrainerService } from './trainer.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private attendanceService = inject(AttendanceService);
  private enquiryService = inject(EnquiryService);
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);
  private planService = inject(PlanService);
  private trainerService = inject(TrainerService);

  getSummary() {
    const plans = this.planService.list();
    const members = this.memberService.list();
    const payments = this.paymentService.list();
    const pendingPayments = payments.filter((payment) => payment.status === 'Pending');
    const completedPayments = payments.filter((payment) => payment.status === 'Completed');
    this.attendanceService.seedToday(members);
    const attendance = this.attendanceService.getSummary(members.length);
    const activePlans = plans.filter((plan) => plan.status === 'Active').length;
    const activeMembers = members.filter((member) => member.active).length;
    const trialMembers = members.filter((member) => member.active && (member.duration || 0) <= 1).length;
    const ptPayments = payments.filter((payment) => payment.plan.toLowerCase().includes('pt'));
    const trainers = this.trainerService.list().filter((trainer) => trainer.role === 'Trainer');

    return {
      totalMembers: members.length,
      activeMembers,
      monthlyRevenue: completedPayments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPlans: plans.length,
      activePlans,
      expiringSoon: this.getExpiringSoon(members),
      totalEnquiries: this.enquiryService.list().length,
      todaysCheckIns: attendance.todaysCheckIns,
      insideGym: attendance.insideGym,
      peakTime: attendance.peakTime,
      occupancyPercent: attendance.occupancyPercent,
      pendingPaymentCount: pendingPayments.length,
      pendingPaymentAmount: pendingPayments.reduce((sum, payment) => sum + (payment.pendingAmount || payment.amount), 0),
      trialMembers,
      ptSessionPayments: ptPayments.length,
      trainerCount: trainers.length,
      activeTrainerCount: trainers.filter((trainer) => trainer.status === 'Active').length,
      retentionPercent: members.length ? Math.round((activeMembers / members.length) * 100) : 0
    };
  }

  getRevenueChart() {
    const payments = this.paymentService.list().filter((payment) => payment.status === 'Completed');
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
          data: months.map((month) =>
            payments
              .filter((payment) => {
                const paidAt = new Date(payment.paidAt);
                return paidAt.getMonth() === month.getMonth() && paidAt.getFullYear() === month.getFullYear();
              })
              .reduce((sum, payment) => sum + payment.amount, 0)
          )
        }
      ]
    };
  }

  getRecentPayments() {
    return this.paymentService
      .list()
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
      .slice(0, 8)
      .map((payment) => ({
        member: payment.member,
        plan: payment.plan,
        amount: payment.amount,
        method: payment.method,
        date: new Date(payment.paidAt).toISOString().slice(0, 10),
        status: payment.status
      }));
  }

  getHourlyFootfall() {
    return this.attendanceService.getHourlyFootfall();
  }

  private getExpiringSoon(members: ReturnType<MemberService['list']>): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soon = new Date(today);
    soon.setDate(today.getDate() + 30);

    return members.filter((member) => {
      if (!member.active) {
        return false;
      }

      const start = new Date(member.startDate);
      if (Number.isNaN(start.getTime())) {
        return false;
      }

      start.setMonth(start.getMonth() + (member.duration || 1));
      return start >= today && start <= soon;
    }).length;
  }
}
