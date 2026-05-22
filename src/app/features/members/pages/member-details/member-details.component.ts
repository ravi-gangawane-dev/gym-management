import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../../core/services/member.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Member } from '../../../../core/models/member.model';
import { Payment } from '../../../../core/models/payment.model';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';
import { ProfileImageViewerComponent } from '../../../../shared/components/profile-image-viewer/profile-image-viewer.component';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, MessageModule, ProfileImageViewerComponent],
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss']
})
export class MemberDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);
  private confirmation = inject(AppConfirmationService);
  private toast = inject(ToastService);

  member: Member | null = null;
  memberPayments: Payment[] = [];
  daysRemaining = 0;
  activeTab: 'personal' | 'membership' | 'payment' = 'personal';
  previewImage: { src: string; alt: string } | null = null;

  ngOnInit(): void {
    const memberId = this.route.snapshot.paramMap.get('id');
    if (memberId) {
      const memberData = this.memberService.getById(memberId);
      this.member = memberData || null;
      this.loadPaymentHistory();
      this.calculateDaysRemaining();
    }
  }

  private loadPaymentHistory(): void {
    if (!this.member) return;
    const allPayments = this.paymentService.list();
    const memberName = this.member.fullName || `${this.member.firstName} ${this.member.lastName}`.trim();
    this.memberPayments = allPayments.filter((payment) => payment.memberId === this.member?.id || payment.member === memberName);
  }

  private calculateDaysRemaining(): void {
    if (!this.member) return;
    const startDate = new Date(this.member.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + this.member.duration);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    this.daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  getEndDate(): Date {
    if (!this.member) return new Date();
    const startDate = new Date(this.member.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + this.member.duration);
    return endDate;
  }

  getTotalPaymentAmount(): number {
    return this.memberPayments.reduce((sum, p) => {
      const paidAmount = p.paidAmount ?? p.amount ?? 0;
      const pendingAmount = p.pendingAmount ?? 0;
      return sum + paidAmount + pendingAmount;
    }, 0);
  }

  getReceivedPayments(): number {
    return this.memberPayments.reduce((sum, p) => sum + (p.paidAmount ?? p.amount ?? 0), 0);
  }

  getPendingPayments(): number {
    return this.memberPayments.reduce((sum, p) => sum + (p.pendingAmount ?? 0), 0);
  }

  getMemberAddons(): string[] {
    const addons = this.memberPayments.flatMap((payment) => payment.addons ?? []);
    return Array.from(new Set(addons.map((addon) => addon.trim()).filter(Boolean)));
  }

  getPaymentEntryName(payment: Payment): string {
    const addons = (payment.addons ?? []).map((addon) => addon.trim()).filter(Boolean);
    return addons.length ? addons.join(', ') : payment.plan;
  }

  getMembershipStatus(): 'Active' | 'Expired' | 'Inactive' {
    if (!this.member?.active) {
      return 'Inactive';
    }

    return this.daysRemaining > 0 ? 'Active' : 'Expired';
  }

  getDurationLabel(): string {
    const duration = this.member?.duration ?? 0;
    return `${duration} ${duration === 1 ? 'month' : 'months'}`;
  }

  getRemainingDaysLabel(): string {
    if (this.daysRemaining < 0) {
      return `${Math.abs(this.daysRemaining)} days overdue`;
    }

    if (this.daysRemaining === 0) {
      return 'Expires today';
    }

    return `${this.daysRemaining} days remaining`;
  }

  getLastPayment(): Payment | undefined {
    return [...this.memberPayments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];
  }

  isImageUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  setActiveTab(tab: 'personal' | 'membership' | 'payment'): void {
    this.activeTab = tab;
  }

  openImagePreview(src: string, alt: string): void {
    if (src) {
      this.previewImage = { src, alt };
    }
  }

  editMember(): void {
    if (this.member) {
      this.router.navigate(['/members/edit', this.member.id]);
    }
  }

  deleteMember(): void {
    if (!this.member) {
      return;
    }

    this.confirmation.permanentDelete({
      name: this.member.fullName,
      accept: () => {
        this.memberService.delete(this.member!.id);
        this.toast.success('Member Deleted', 'The member has been removed successfully.');
        this.router.navigate(['/members']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/members']);
  }
}
