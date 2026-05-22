export interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role?: 'Trainer' | 'Receptionist' | 'Manager';
    specialization: string;
    phone: string;
    email: string;
    gender: 'Male' | 'Female' | 'Other';
    experienceYears: number;
    salary?: number;
    permissions?: string[];
    photo?: string;
    certifications: string;
    status: 'Active' | 'Inactive' | 'On Leave';
    notes: string;
}
