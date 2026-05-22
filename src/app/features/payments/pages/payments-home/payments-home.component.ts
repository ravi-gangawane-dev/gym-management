import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { DateRangeSelectorComponent, DateRangeValue } from '../../../../shared/components/date-range-selector/date-range-selector.component';
import { FilterConfig, FilterState } from '../../../../shared/components/dynamic-filters/dynamic-filters.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';
import { Payment } from '../../../../core/models/payment.model';
import { Member } from '../../../../core/models/member.model';
import { MemberService } from '../../../../core/services/member.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { PlanService } from '../../../../core/services/plan.service';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface PlanTemplate {
    name: string;
    price: number;
    label: string;
    months: number;
    highlights: string[];
    best?: boolean;
}

interface AddonOption {
    label: string;
    amount: number;
    selected: boolean;
}

type PaymentFlow = 'new' | 'renew' | 'pt' | 'addons';

@Component({
    selector: 'app-payments-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DatePickerModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        PaginatorModule,
        DateRangeSelectorComponent,
        EmptyStateComponent,
        SearchBarComponent,
        TableToolbarComponent
    ],
    templateUrl: './payments-home.component.html',
    styleUrls: ['./payments-home.component.scss']
})
export class PaymentsHomeComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private memberService = inject(MemberService);
    private paymentService = inject(PaymentService);
    private planService = inject(PlanService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);
    private readonly filterStorageKey = 'gym_payment_filters';

    selectedFlow: PaymentFlow = 'new';
    autoRenew = false;
    renewSelection = '1 Month';
    selectedPtOption = 'Per Session';
    customAddon = { label: '', amount: null as number | null };

    planTemplates: PlanTemplate[] = [
        {
            name: '1 Month Plan',
            price: 999,
            label: 'Basic Access',
            months: 1,
            highlights: ['Gym entry', 'Locker access', 'One review session']
        },
        {
            name: '3 Month Plan',
            price: 2699,
            label: 'Standard Access',
            months: 3,
            highlights: ['Priority booking', 'Group classes', 'Nutrition tips']
        },
        {
            name: '6 Month Plan',
            price: 4999,
            label: 'Premium Access',
            months: 6,
            highlights: ['Free PT session', 'Sauna access', 'Progress tracking']
        },
        {
            name: '12 Month Plan',
            price: 8999,
            label: 'Premium Access',
            months: 12,
            highlights: ['Free PT session', 'VIP support', 'Yearly reward'],
            best: true
        }
    ];

    renewOptions = [
        { name: '1 Month', price: 999 },
        { name: '3 Months', price: 2699 },
        { name: '6 Months', price: 4999 },
        { name: '12 Months', price: 8999 }
    ];

    ptOptions = [
        { name: 'Per Session', price: 799, description: 'Single training session' },
        { name: 'Monthly PT package', price: 4999, description: '8 sessions per month' },
        { name: 'Transformation package', price: 12999, description: 'Personal training with nutrition' }
    ];

    addonsOptions: AddonOption[] = [
        { label: 'Locker', amount: 199, selected: false },
        { label: 'Personal Training', amount: 4999, selected: false },
        { label: 'Diet Plan', amount: 999, selected: false },
        { label: 'Swimming', amount: 1499, selected: false },
        { label: 'Yoga', amount: 399, selected: false },
        { label: 'Steam Bath', amount: 599, selected: false }
    ];

    paymentMethods = [
        { id: 'UPI', label: 'UPI', description: 'QR-first checkout' },
        { id: 'Cash', label: 'Cash', description: 'Instant receptionist payment' },
        { id: 'Credit Card', label: 'Credit Card', description: 'Card swipe / POS' },
        { id: 'Debit Card', label: 'Debit Card', description: 'Chip or contactless' },
        { id: 'Net Banking', label: 'Net Banking', description: 'Online bank transfer' },
        { id: 'Wallet', label: 'Wallet', description: 'Phone wallet payment' },
        { id: 'EMI', label: 'EMI', description: 'Installment option' }
    ];

    payments: Payment[] = [];
    editingPayment?: Payment;
    sortField: keyof Payment = 'paidAt';
    sortDirection: 1 | -1 = -1;
    columnFilters: Partial<Record<keyof Payment, string>> = {};
    columnAmountFilters: Partial<Record<'totalAmount' | 'paidAmount' | 'pendingAmount', number | null>> = {};
    columnDateFilter: Date | null = null;
    filterState: FilterState = {};
    dateRange: DateRangeValue = { start: null, end: null, preset: null };
    searchTerm = '';
    first = 0;
    rows = 10;

    get isHistoryMode(): boolean {
        return this.route.snapshot.data['mode'] !== 'checkout';
    }

    get isCheckoutMode(): boolean {
        return this.route.snapshot.data['mode'] === 'checkout';
    }

    get hasSelectedMember(): boolean {
        return !!this.paymentForm.memberId;
    }

    get isServiceCheckout(): boolean {
        return this.selectedFlow === 'addons';
    }

    get canShowCheckoutSections(): boolean {
        return this.hasSelectedMember || this.isServiceCheckout;
    }

    paymentForm: Omit<Payment, 'id' | 'paidAt'> = {
        memberId: undefined,
        membershipId: '',
        member: '',
        plan: '',
        amount: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        method: 'UPI',
        addons: [],
        discount: 0,
        couponCode: 'FITNESS20',
        invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        status: 'Completed',
        expiryDate: '15 Nov 2026',
        emiMonths: undefined,
        emiSchedule: []
    };

    constructor() {
        this.restoreFilters();
        this.loadPayments();
    }

    get paymentFilterConfigs(): FilterConfig[] {
        return [
            { key: 'method', label: 'Payment Type', type: 'paymentType', placeholder: 'All methods', options: this.paymentMethods.map((method) => method.label) },
            { key: 'status', label: 'Status', type: 'status', placeholder: 'All status', options: ['Completed', 'Pending', 'Failed'] },
            { key: 'plan', label: 'Plan / Add-on Services', type: 'select', placeholder: 'All entries', options: this.paymentPlanOptions },
            { key: 'amount', label: 'Amount Range', type: 'amount', minPlaceholder: 'Min amount', maxPlaceholder: 'Max amount' }
        ];
    }

    get paymentPlanOptions(): string[] {
        return Array.from(new Set(this.payments.map((payment) => this.getPaymentEntryName(payment)))).sort();
    }

    ngOnInit(): void {
        const memberId = this.route.snapshot.queryParamMap.get('memberId');
        const plan = this.route.snapshot.queryParamMap.get('plan');
        const editPaymentId = this.route.snapshot.queryParamMap.get('editPaymentId');
        const member = memberId ? this.memberService.getById(memberId) : undefined;

        if (member) {
            this.applyMember(member);
        } else if (this.route.snapshot.queryParamMap.get('member')) {
            this.paymentForm.member = this.route.snapshot.queryParamMap.get('member') ?? this.paymentForm.member;
        }

        if (plan) {
            this.paymentForm.plan = plan;
        }
        if (editPaymentId) {
            const payment = this.paymentService.getById(editPaymentId);
            if (payment) {
                this.editPayment(payment);
            }
        }
        this.updateTotals();
    }

    get memberOptions(): Array<{ label: string; value: string }> {
        return this.memberService.list().map((member, index) => ({
            label: `${member.fullName || `${member.firstName} ${member.lastName}`.trim()} - ${this.toDisplayMemberId(member.id, index)}`,
            value: member.id
        }));
    }

    get membershipFee(): number {
        if (this.isServiceCheckout) {
            return 0;
        }

        const checkoutPlan = this.planTemplates.find((plan) => plan.name === this.paymentForm.plan);
        const savedPlan = this.planService.list().find((plan) => plan.name === this.paymentForm.plan);
        return checkoutPlan?.price ?? savedPlan?.price ?? this.paymentForm.amount;
    }

    get addonsTotal(): number {
        return this.addonsOptions.filter((addon) => addon.selected).reduce((sum, addon) => sum + addon.amount, 0);
    }

    get discountValue(): number {
        return this.paymentForm.discount || 0;
    }

    get gstValue(): number {
        return Math.round((this.membershipFee + this.addonsTotal - this.discountValue) * 0.18);
    }

    get totalAmount(): number {
        return Math.max(0, this.membershipFee + this.addonsTotal - this.discountValue + this.gstValue);
    }

    get hasPendingAmount(): boolean {
        return (this.paymentForm.pendingAmount ?? 0) > 0;
    }

    get completedPayments(): number {
        return this.payments.filter((payment) => payment.status === 'Completed').length;
    }

    get pendingPayments(): number {
        return this.payments.filter((payment) => payment.status === 'Pending').length;
    }

    get failedPayments(): number {
        return this.payments.filter((payment) => payment.status === 'Failed').length;
    }

    get totalRevenue(): number {
        return this.payments
            .filter((payment) => payment.status === 'Completed')
            .reduce((sum, payment) => sum + (payment.paidAmount ?? payment.amount), 0);
    }

    get sortedPayments(): Payment[] {
        const field = this.sortField;
        const direction = this.sortDirection;
        return [...this.filteredPayments].sort((a, b) => {
            const leftValue = field === 'plan' ? this.getPaymentEntryName(a) : a[field];
            const rightValue = field === 'plan' ? this.getPaymentEntryName(b) : b[field];
            const left = String(leftValue ?? '').toLowerCase();
            const right = String(rightValue ?? '').toLowerCase();
            return left.localeCompare(right, undefined, { numeric: true }) * direction;
        });
    }

    get filteredPayments(): Payment[] {
        const term = this.searchTerm.trim().toLowerCase();

        return this.payments.filter((payment) => {
            const matchesSearch =
                !term ||
                [payment.member, payment.membershipId, this.getPaymentEntryName(payment), payment.method, payment.status, payment.invoiceId]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesSearch && this.matchesDateRange(payment) && this.matchesColumnFilters(payment);
        });
    }

    get pagedPayments(): Payment[] {
        return this.sortedPayments.slice(this.first, this.first + this.rows);
    }

    get showingStart(): number {
        return this.filteredPayments.length ? this.first + 1 : 0;
    }

    get showingEnd(): number {
        return Math.min(this.first + this.rows, this.filteredPayments.length);
    }

    get selectedPlanMonths(): number {
        const plan = this.planTemplates.find((item) => item.name === this.paymentForm.plan);
        if (plan) {
            return plan.months;
        }

        const duration = Number(this.paymentForm.plan.match(/\d+/)?.[0]);
        return Number.isFinite(duration) ? duration : 1;
    }

    get emiAvailable(): boolean {
        return this.selectedPlanMonths === 6 || this.selectedPlanMonths === 12;
    }

    selectFlow(flow: PaymentFlow): void {
        this.selectedFlow = flow;
        if (flow === 'addons') {
            this.paymentForm.plan = 'Add-on Services';
            this.paymentForm.amount = 0;
            this.paymentForm.totalAmount = 0;
            this.paymentForm.paidAmount = 0;
            this.paymentForm.pendingAmount = 0;
            if (!this.paymentForm.memberId) {
                this.paymentForm.membershipId = 'WALK-IN';
                this.paymentForm.expiryDate = undefined;
            }
        } else if (!this.paymentForm.memberId && this.paymentForm.membershipId === 'WALK-IN') {
            this.paymentForm.membershipId = '';
            this.paymentForm.member = '';
        }
        this.updateTotals();
    }

    selectPlan(plan: PlanTemplate): void {
        this.paymentForm.plan = plan.name;
        this.paymentForm.amount = plan.price;
        this.paymentForm.expiryDate = this.calculateExpiryDate(plan.months);
        this.resetSelections();
    }

    applyRenewOption(option: { name: string; price: number }): void {
        this.paymentForm.plan = option.name;
        this.paymentForm.amount = option.price;
        this.paymentForm.expiryDate = this.calculateExpiryDate(option.name.includes('Month') ? Number(option.name.split(' ')[0]) : 1);
        this.updateTotals();
    }

    applyPtOption(option: { name: string; price: number }): void {
        this.paymentForm.plan = option.name;
        this.paymentForm.amount = option.price;
        this.paymentForm.expiryDate = this.calculateExpiryDate(1);
        this.updateTotals();
    }

    updateTotals(): void {
        this.paymentForm.addons = this.addonsOptions.filter((addon) => addon.selected).map((addon) => addon.label);
        const total = this.totalAmount;
        const paidAmount = this.paymentForm.paidAmount ?? 0;

        this.paymentForm.totalAmount = total;
        this.paymentForm.amount = this.membershipFee;
        this.paymentForm.paidAmount = Math.min(Math.max(0, paidAmount), total);
        this.paymentForm.pendingAmount = Math.max(0, total - this.paymentForm.paidAmount);
        this.syncEmiSchedule();
    }

    applyCoupon(): void {
        if (this.paymentForm.couponCode?.trim()?.toUpperCase() === 'FITNESS20') {
            this.paymentForm.discount = 500;
            this.toast.success('Coupon Applied', 'Rs. 500 discount applied successfully.');
        } else {
            this.paymentForm.discount = 0;
            this.toast.error('Invalid Coupon', 'Enter a valid coupon code.');
        }
    }

    processPayment(): void {
        this.updateTotals();
        this.paymentForm.status = (this.paymentForm.pendingAmount || 0) > 0 ? 'Pending' : 'Completed';
        const message = this.isServiceCheckout
            ? 'Service payment completed and invoice generated.'
            : 'Membership payment completed and invoice generated.';
        this.savePayment('Payment Successful', message);
    }

    saveDraft(): void {
        this.updateTotals();
        if (!this.hasPendingAmount) {
            return;
        }
        this.paymentForm.status = 'Pending';
        this.savePayment('Draft Saved', 'The payment draft has been saved for later.');
    }

    loadPayments(): void {
        this.payments = this.paymentService.list();
    }

    savePayment(successTitle = 'Payment Saved', successMessage = 'Payment entry has been saved successfully.'): void {
        if (!this.hasSelectedMember && !this.isServiceCheckout) {
            this.toast.error('Validation Error', 'Select a member before recording this payment.');
            return;
        }

        if (!this.paymentForm.member.trim()) {
            this.toast.error('Validation Error', this.isServiceCheckout ? 'Customer name is required.' : 'Member name is required.');
            return;
        }

        if (this.isServiceCheckout && !this.paymentForm.addons.length) {
            this.toast.error('Validation Error', 'Select at least one add-on service.');
            return;
        }

        this.updateTotals();

        if ((this.paymentForm.paidAmount ?? 0) < 0 || (this.paymentForm.totalAmount ?? 0) <= 0) {
            this.toast.error('Validation Error', 'Payment amount must be greater than 0.');
            return;
        }

        if (this.editingPayment) {
            this.paymentService.update(this.editingPayment.id, this.paymentForm);
        } else {
            this.paymentService.add(this.paymentForm);
        }

        this.toast.success(successTitle, successMessage);
        this.resetForm();
        this.loadPayments();
        this.resetPage();
    }

    editPayment(payment: Payment): void {
        if (this.isHistoryMode) {
            this.router.navigate(['/payments/add'], { queryParams: { editPaymentId: payment.id } });
            return;
        }

        this.editingPayment = { ...payment };
        this.paymentForm = {
            memberId: payment.memberId,
            membershipId: payment.membershipId,
            member: payment.member,
            plan: payment.plan,
            amount: payment.amount,
            totalAmount: payment.totalAmount ?? payment.amount,
            paidAmount: payment.paidAmount ?? payment.amount,
            pendingAmount: payment.pendingAmount ?? 0,
            method: payment.method,
            addons: [...payment.addons],
            discount: payment.discount,
            couponCode: payment.couponCode,
            invoiceId: payment.invoiceId,
            status: payment.status,
            expiryDate: payment.expiryDate,
            emiMonths: payment.emiMonths,
            emiSchedule: payment.emiSchedule ?? []
        };
        this.updateAddonSelections();
    }

    confirmDelete(payment: Payment): void {
        this.confirmation.permanentDelete({
            name: `payment for ${payment.member}`,
            accept: () => {
                this.paymentService.delete(payment.id);
                this.toast.success('Payment Deleted', 'The payment entry was removed successfully.');
                this.loadPayments();
                if (this.editingPayment?.id === payment.id) {
                    this.resetForm();
                }
            }
        });
    }

    resetForm(): void {
        this.editingPayment = undefined;
        this.paymentForm = {
            memberId: undefined,
            membershipId: '',
            member: '',
            plan: '',
            amount: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            method: 'UPI',
            addons: [],
            discount: 0,
            couponCode: 'FITNESS20',
            invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            status: 'Completed',
            expiryDate: '15 Nov 2026',
            emiMonths: undefined,
            emiSchedule: []
        };
        this.autoRenew = false;
        this.addonsOptions.forEach((addon) => (addon.selected = false));
        this.selectedFlow = 'new';
        this.renewSelection = '1 Month';
        this.selectedPtOption = 'Per Session';
        this.customAddon = { label: '', amount: null };
    }

    onMemberChange(event: SelectChangeEvent): void {
        const member = this.memberService.getById(String(event.value));
        if (member) {
            this.applyMember(member);
        }
    }

    onPaidAmountChange(): void {
        this.updateTotals();
    }

    addCustomAddon(): void {
        const label = this.customAddon.label.trim();
        const amount = this.customAddon.amount ?? 0;

        if (!label || amount <= 0) {
            this.toast.error('Validation Error', 'Enter service name and amount.');
            return;
        }

        this.addonsOptions = [...this.addonsOptions, { label, amount, selected: true }];
        this.customAddon = { label: '', amount: null };
        this.updateTotals();
    }

    sortBy(field: keyof Payment): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 1 ? -1 : 1;
        } else {
            this.sortField = field;
            this.sortDirection = 1;
        }
        this.resetPage();
    }

    sortIcon(field: keyof Payment): string {
        if (this.sortField !== field) {
            return 'pi pi-sort-alt';
        }
        return this.sortDirection === 1 ? 'pi pi-sort-amount-down-alt' : 'pi pi-sort-amount-up';
    }

    onColumnFilterChange(): void {
        this.persistFilters();
        this.resetPage();
    }

    clearColumnFilter(field: keyof Payment): void {
        this.columnFilters[field] = '';
        this.onColumnFilterChange();
    }

    clearColumnDateFilter(): void {
        this.columnDateFilter = null;
        this.onColumnFilterChange();
    }

    clearColumnAmountFilter(field: 'totalAmount' | 'paidAmount' | 'pendingAmount'): void {
        this.columnAmountFilters[field] = null;
        this.onColumnFilterChange();
    }

    setSearch(value: string): void {
        this.searchTerm = value;
        this.persistFilters();
        this.resetPage();
    }

    setPaymentFilters(filters: FilterState): void {
        this.filterState = { ...filters };
        this.persistFilters();
        this.resetPage();
    }

    setDateRange(value: DateRangeValue): void {
        this.dateRange = value;
        this.persistFilters();
        this.resetPage();
    }

    goToAddPayment(): void {
        this.router.navigate(['/payments/add']);
    }

    goToPaymentHistory(): void {
        this.router.navigate(['/payments']);
    }

    resetHistoryFilters(): void {
        this.searchTerm = '';
        this.filterState = {};
        this.dateRange = { start: null, end: null, preset: null };
        this.columnFilters = {};
        this.columnAmountFilters = {};
        this.columnDateFilter = null;
        this.persistFilters();
        this.resetPage();
    }

    onPageChange(event: PaginatorState): void {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }

    getPaymentEntryName(payment: Pick<Payment, 'plan' | 'addons'>): string {
        const addons = (payment.addons ?? []).map((addon) => addon.trim()).filter(Boolean);
        return addons.length ? addons.join(', ') : payment.plan;
    }

    exportPayments(): void {
        const headers = ['Member', 'Membership ID', 'Plan / Add-on Services', 'Total', 'Paid', 'Pending', 'Method', 'Status', 'Paid On'];
        const rows = this.sortedPayments.map((payment) => [
            payment.member,
            payment.membershipId,
            this.getPaymentEntryName(payment),
            payment.totalAmount ?? payment.amount,
            payment.paidAmount ?? payment.amount,
            payment.pendingAmount || 0,
            payment.method,
            payment.status,
            new Date(payment.paidAt).toLocaleDateString('en-IN')
        ]);
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'payment-history.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    private updateAddonSelections(): void {
        this.addonsOptions.forEach((addon) => {
            addon.selected = this.paymentForm.addons.includes(addon.label);
        });
    }

    private calculateExpiryDate(months: number): string {
        const today = new Date();
        today.setMonth(today.getMonth() + months);
        return today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    private resetSelections(): void {
        this.addonsOptions.forEach((addon) => (addon.selected = false));
        this.paymentForm.addons = [];
        this.paymentForm.discount = 0;
    }

    private applyMember(member: Member): void {
        const members = this.memberService.list();
        this.paymentForm.memberId = member.id;
        this.paymentForm.member = member.fullName || `${member.firstName} ${member.lastName}`.trim();
        this.paymentForm.membershipId = this.toDisplayMemberId(member.id, members.findIndex((item) => item.id === member.id));
        this.paymentForm.plan = member.planName || this.paymentForm.plan;
        this.paymentForm.expiryDate = member.startDate ? this.calculateExpiryDate(member.duration || 1) : this.paymentForm.expiryDate;
        this.updateTotals();
    }

    private syncEmiSchedule(): void {
        if (this.paymentForm.method !== 'EMI' || !this.emiAvailable) {
            this.paymentForm.emiMonths = undefined;
            this.paymentForm.emiSchedule = [];
            return;
        }

        const months = this.selectedPlanMonths;
        const total = this.paymentForm.totalAmount ?? this.totalAmount;
        const paid = this.paymentForm.paidAmount ?? 0;
        const installmentAmount = Math.ceil(total / months);

        this.paymentForm.emiMonths = months;
        this.paymentForm.emiSchedule = Array.from({ length: months }, (_, index) => {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + index);
            const installmentTotal = index === months - 1 ? total - installmentAmount * (months - 1) : installmentAmount;
            return {
                installment: index + 1,
                dueDate: dueDate.toISOString(),
                amount: installmentTotal,
                paid: paid >= installmentAmount * (index + 1)
            };
        });
    }

    private toDisplayMemberId(id: string, index: number): string {
        const numericPart = id.replace(/\D/g, '').slice(0, 3);
        return `1231${String(Math.max(0, index) + 1).padStart(3, '0')}${numericPart}`.slice(0, 7);
    }

    private matchesColumnFilters(payment: Payment): boolean {
        const textMatches = (Object.entries(this.columnFilters) as Array<[keyof Payment, string]>).every(([field, value]) => {
            const term = value?.trim().toLowerCase();
            const fieldValue = field === 'plan' ? this.getPaymentEntryName(payment) : payment[field];
            return !term || String(fieldValue ?? '').toLowerCase().includes(term);
        });

        const paidAt = new Date(payment.paidAt);

        return (
            textMatches &&
            (!this.columnAmountFilters.totalAmount || (payment.totalAmount ?? payment.amount) >= this.columnAmountFilters.totalAmount) &&
            (!this.columnAmountFilters.paidAmount || (payment.paidAmount ?? payment.amount) >= this.columnAmountFilters.paidAmount) &&
            (!this.columnAmountFilters.pendingAmount || (payment.pendingAmount || 0) >= this.columnAmountFilters.pendingAmount) &&
            (!this.columnDateFilter || (!Number.isNaN(paidAt.getTime()) && paidAt.toISOString().slice(0, 10) === this.columnDateFilter.toISOString().slice(0, 10)))
        );
    }

    private matchesDynamicFilters(payment: Payment): boolean {
        const method = this.filterState['method'];
        const status = this.filterState['status'];
        const plan = this.filterState['plan'];
        const amount = this.filterState['amount'] as { min?: number | null; max?: number | null } | undefined;
        const total = payment.totalAmount ?? payment.amount;

        return (
            (!method || payment.method === method) &&
            (!status || payment.status === status) &&
            (!plan || this.getPaymentEntryName(payment) === plan) &&
            (!amount?.min || total >= amount.min) &&
            (!amount?.max || total <= amount.max)
        );
    }

    private matchesDateRange(payment: Payment): boolean {
        if (!this.dateRange.start && !this.dateRange.end) {
            return true;
        }

        const paidAt = new Date(payment.paidAt);
        paidAt.setHours(0, 0, 0, 0);
        const start = this.dateRange.start ? new Date(this.dateRange.start) : null;
        const end = this.dateRange.end ? new Date(this.dateRange.end) : null;
        start?.setHours(0, 0, 0, 0);
        end?.setHours(23, 59, 59, 999);

        return (!start || paidAt >= start) && (!end || paidAt <= end);
    }

    private resetPage(): void {
        this.first = 0;
    }

    private persistFilters(): void {
        localStorage.setItem(
            this.filterStorageKey,
            JSON.stringify({
                search: this.searchTerm,
                dynamic: this.filterState,
                columns: this.columnFilters,
                amounts: this.columnAmountFilters,
                paidAt: this.columnDateFilter,
                dateRange: this.dateRange
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
                columns?: Partial<Record<keyof Payment, string>>;
                amounts?: Partial<Record<'totalAmount' | 'paidAmount' | 'pendingAmount', number | null>>;
                paidAt?: string | null;
                dateRange?: DateRangeValue;
            };
            this.searchTerm = parsed.search ?? '';
            this.filterState = parsed.dynamic ?? {};
            this.columnFilters = parsed.columns ?? {};
            this.columnAmountFilters = parsed.amounts ?? {};
            this.columnDateFilter = parsed.paidAt ? new Date(parsed.paidAt) : null;
            this.dateRange = {
                start: parsed.dateRange?.start ? new Date(parsed.dateRange.start) : null,
                end: parsed.dateRange?.end ? new Date(parsed.dateRange.end) : null,
                preset: parsed.dateRange?.preset ?? null
            };
        } catch {
            localStorage.removeItem(this.filterStorageKey);
        }
    }
}
