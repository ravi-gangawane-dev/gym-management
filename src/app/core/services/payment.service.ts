import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Payment } from '../models/payment.model';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const KEY = 'gym_payments';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private storage: LocalStorageService) {
    if (!isDemoDataEmptyMode()) {
      this.seed();
    }
  }

  list(): Payment[] {
    return this.normalize(this.storage.get<Payment[]>(KEY, []));
  }

  getById(id: string): Payment | undefined {
    return this.list().find((payment) => payment.id === id);
  }

  add(payment: Omit<Payment, 'id' | 'paidAt'>): Payment {
    const created: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      paidAt: new Date().toISOString()
    };

    this.storage.set(KEY, [created, ...this.list()]);
    return created;
  }

  update(id: string, payment: Omit<Payment, 'id' | 'paidAt'>): Payment {
    const items = this.list();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Payment not found');
    }

    const updated: Payment = {
      ...items[index],
      ...payment,
      id,
      paidAt: items[index].paidAt
    };

    items[index] = updated;
    this.storage.set(KEY, items);
    return updated;
  }

  delete(id: string): void {
    this.storage.set(KEY, this.list().filter((item) => item.id !== id));
  }

  private normalize(value: unknown): Payment[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      if (!item || typeof item !== 'object') {
        return {
          id: crypto.randomUUID(),
          memberId: undefined,
          member: String(item),
          membershipId: 'UNKNOWN',
          plan: 'Unknown Plan',
          amount: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          paidAt: new Date().toISOString(),
          method: 'Cash',
          addons: [],
          discount: 0,
          couponCode: undefined,
          invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          status: 'Completed' as const,
          expiryDate: undefined,
          emiMonths: undefined,
          emiSchedule: []
        };
      }

      const payload = item as Record<string, unknown>;

      return {
        id: typeof payload['id'] === 'string' ? payload['id'] : crypto.randomUUID(),
        memberId: typeof payload['memberId'] === 'string' ? payload['memberId'] : undefined,
        member: typeof payload['member'] === 'string' ? payload['member'] : 'Unknown Member',
        membershipId: typeof payload['membershipId'] === 'string' ? payload['membershipId'] : 'UNKNOWN',
        plan: typeof payload['plan'] === 'string' ? payload['plan'] : 'Standard Plan',
        amount: Number(payload['amount']) || 0,
        totalAmount: Number(payload['totalAmount']) || Number(payload['amount']) || 0,
        paidAmount: Number(payload['paidAmount']) || Number(payload['amount']) || 0,
        pendingAmount: Math.max(0, Number(payload['pendingAmount']) || 0),
        paidAt: typeof payload['paidAt'] === 'string' ? payload['paidAt'] : new Date().toISOString(),
        method: typeof payload['method'] === 'string' ? payload['method'] : 'Cash',
        addons: Array.isArray(payload['addons']) ? payload['addons'].map(String) : [],
        discount: Number(payload['discount']) || 0,
        couponCode: typeof payload['couponCode'] === 'string' ? payload['couponCode'] : undefined,
        invoiceId:
          typeof payload['invoiceId'] === 'string'
            ? payload['invoiceId']
            : `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        status:
          payload['status'] === 'Pending' || payload['status'] === 'Failed' ? (payload['status'] as 'Pending' | 'Failed') : 'Completed',
        expiryDate: typeof payload['expiryDate'] === 'string' ? payload['expiryDate'] : undefined,
        emiMonths: Number(payload['emiMonths']) || undefined,
        emiSchedule: Array.isArray(payload['emiSchedule'])
          ? payload['emiSchedule'].map((entry) => {
              const emi = entry as Record<string, unknown>;
              return {
                installment: Number(emi['installment']) || 1,
                dueDate: typeof emi['dueDate'] === 'string' ? emi['dueDate'] : new Date().toISOString(),
                amount: Number(emi['amount']) || 0,
                paid: Boolean(emi['paid'])
              };
            })
          : []
      };
    });
  }

  private seed(): void {
    const existing = this.normalize(this.storage.get<Payment[]>(KEY, []));
    const demoPayments: Payment[] = [
      this.payment('demo-payment-001', 'Arjun Verma', 'GYM1001', 'Gold', 3185, 'UPI', 'Completed', -2, ['Locker'], 0, 'INV-2026-1001'),
      this.payment('demo-payment-002', 'Neha Sharma', 'GYM1002', 'Platinum', 5898, 'Credit Card', 'Completed', -4, ['Yoga'], 0, 'INV-2026-1002'),
      this.payment('demo-payment-003', 'Rohan Mehra', 'GYM1003', 'Annual Elite', 10619, 'Debit Card', 'Completed', -6, ['Steam Bath'], 0, 'INV-2026-1003'),
      this.payment('demo-payment-004', 'Priya Singh', 'GYM1004', 'Basic', 1179, 'Cash', 'Pending', -1, [], 0, 'INV-2026-1004'),
      this.payment('demo-payment-005', 'Karan Gupta', 'GYM1005', 'Gold', 2685, 'UPI', 'Completed', -1, [], 500, 'INV-2026-1005'),
      this.payment('demo-payment-006', 'Ananya Jain', 'GYM1006', 'PT Transformation', 15339, 'Net Banking', 'Completed', -1, ['Diet Consultation'], 500, 'INV-2026-1006'),
      this.payment('demo-payment-007', 'Vivek Patel', 'GYM1007', 'Annual Elite', 10619, 'Wallet', 'Completed', -3, [], 0, 'INV-2026-1007'),
      this.payment('demo-payment-008', 'Sahil Verma', 'GYM1009', 'Basic', 1179, 'UPI', 'Failed', -2, [], 0, 'INV-2026-1008'),
      this.payment('demo-payment-009', 'Devansh Iyer', 'GYM1015', 'PT Transformation', 15339, 'Credit Card', 'Completed', 0, ['Diet Consultation', 'Locker'], 500, 'INV-2026-1009'),
      this.payment('demo-payment-010', 'Aisha Khan', 'GYM1016', 'Basic', 1179, 'Cash', 'Completed', 0, [], 0, 'INV-2026-1010'),
      this.payment('demo-payment-011', 'Meera Chopra', 'GYM1021', 'Platinum', 5898, 'UPI', 'Completed', -1, ['Yoga'], 0, 'INV-2026-1011'),
      this.payment('demo-payment-012', 'Kabir Malhotra', 'GYM1022', 'Annual Elite', 10619, 'Net Banking', 'Pending', -1, ['Locker'], 1000, 'INV-2026-1012'),
      this.payment('demo-payment-013', 'Zoya Mirza', 'GYM1023', 'Gold', 3185, 'Debit Card', 'Completed', -2, [], 0, 'INV-2026-1013'),
      this.payment('demo-payment-014', 'Naveen Balan', 'GYM1024', 'Basic', 1179, 'Cash', 'Completed', -2, [], 0, 'INV-2026-1014'),
      this.payment('demo-payment-015', 'Tara Menon', 'GYM1025', 'Student Flex', 1769, 'Wallet', 'Failed', -3, [], 0, 'INV-2026-1015'),
      this.payment('demo-payment-016', 'Yash Agarwal', 'GYM1026', 'PT Transformation', 15339, 'Credit Card', 'Completed', -3, ['Diet Consultation'], 750, 'INV-2026-1016'),
      this.payment('demo-payment-017', 'Leena Thomas', 'GYM1027', 'Gold', 3185, 'UPI', 'Pending', -4, [], 0, 'INV-2026-1017'),
      this.payment('demo-payment-018', 'Farhan Qureshi', 'GYM1028', 'Basic', 1179, 'Cash', 'Failed', -4, [], 0, 'INV-2026-1018'),
      this.payment('demo-payment-019', 'Bhavya Saxena', 'GYM1029', 'Platinum', 5898, 'Net Banking', 'Completed', -5, ['Steam Bath'], 0, 'INV-2026-1019'),
      this.payment('demo-payment-020', 'Nitin Bora', 'GYM1030', 'Gold', 3185, 'UPI', 'Completed', -5, ['Locker'], 500, 'INV-2026-1020'),
      this.payment('demo-payment-021', 'Rhea Dutta', 'GYM1031', 'Annual Elite', 10619, 'Credit Card', 'Completed', -6, [], 0, 'INV-2026-1021'),
      this.payment('demo-payment-022', 'Om Prakash', 'GYM1032', 'Student Flex', 1769, 'UPI', 'Pending', -6, [], 0, 'INV-2026-1022'),
      this.payment('demo-payment-023', 'Gia Lobo', 'GYM1033', 'Basic', 1179, 'Wallet', 'Completed', -7, [], 0, 'INV-2026-1023'),
      this.payment('demo-payment-024', 'Harit Pandey', 'GYM1034', 'Platinum', 5898, 'Debit Card', 'Completed', -7, ['Yoga', 'Locker'], 300, 'INV-2026-1024'),
      this.payment('demo-payment-025', 'Suhani Bedi', 'GYM1035', 'Gold', 3185, 'Cash', 'Completed', -8, [], 0, 'INV-2026-1025'),
      this.payment('demo-payment-026', 'Tushar Naik', 'GYM1036', 'PT Transformation', 15339, 'Net Banking', 'Pending', -8, ['Diet Consultation'], 500, 'INV-2026-1026'),
      this.payment('demo-payment-027', 'Mitali Ghosh', 'GYM1037', 'Basic', 1179, 'UPI', 'Completed', -9, [], 0, 'INV-2026-1027'),
      this.payment('demo-payment-028', 'Parth Doshi', 'GYM1038', 'Annual Elite', 10619, 'Credit Card', 'Failed', -9, [], 0, 'INV-2026-1028'),
      this.payment('demo-payment-029', 'Alia Sheikh', 'GYM1039', 'Platinum', 5898, 'Wallet', 'Completed', -10, ['Yoga'], 0, 'INV-2026-1029'),
      this.payment('demo-payment-030', 'Gaurav Kulkarni', 'GYM1040', 'Gold', 3185, 'Debit Card', 'Completed', -10, [], 0, 'INV-2026-1030')
    ];

    const byInvoice = new Set(existing.map((payment) => payment.invoiceId));
    const missing = demoPayments.filter((payment) => !byInvoice.has(payment.invoiceId));

    if (missing.length) {
      this.storage.set(KEY, [...existing, ...missing]);
    }
  }

  private payment(
    id: string,
    member: string,
    membershipId: string,
    plan: string,
    amount: number,
    method: string,
    status: Payment['status'],
    monthOffset: number,
    addons: string[],
    discount: number,
    invoiceId: string
  ): Payment {
    const paidAt = new Date();
    paidAt.setMonth(paidAt.getMonth() + monthOffset);
    paidAt.setDate(Math.max(1, Math.min(25, paidAt.getDate() - Math.abs(monthOffset))));

    const expiry = new Date(paidAt);
    expiry.setMonth(expiry.getMonth() + (plan.includes('Annual') ? 12 : plan.includes('Platinum') ? 6 : plan.includes('Gold') ? 3 : 1));

    return {
      id,
      member,
      membershipId,
      plan,
      amount,
      totalAmount: amount,
      paidAmount: status === 'Completed' ? amount : 0,
      pendingAmount: status === 'Pending' ? amount : 0,
      paidAt: paidAt.toISOString(),
      method,
      addons,
      discount,
      couponCode: discount ? 'FITNESS20' : undefined,
      invoiceId,
      status,
      expiryDate: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  }
}
