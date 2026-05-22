export interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    sessionsPerWeek: number;
    status: 'Active' | 'Inactive';
    description: string;
    createdAt: string;
}
