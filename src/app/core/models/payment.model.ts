export interface Payment {
    id: string;
    memberId?: string;
    member: string;
    membershipId: string;
    plan: string;
    amount: number;
    totalAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    paidAt: string;
    method: string;
    addons: string[];
    discount: number;
    couponCode?: string;
    invoiceId: string;
    status: 'Completed' | 'Pending' | 'Failed';
    expiryDate?: string;
    emiMonths?: number;
    emiSchedule?: PaymentEmi[];
}

export interface PaymentEmi {
    installment: number;
    dueDate: string;
    amount: number;
    paid: boolean;
}
