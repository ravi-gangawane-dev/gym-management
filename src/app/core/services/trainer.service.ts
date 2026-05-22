import { Injectable } from '@angular/core';
import { Trainer } from '../models/trainer.model';
import { LocalStorageService } from './local-storage.service';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const TRAINERS_KEY = 'gym_trainers';

@Injectable({ providedIn: 'root' })
export class TrainerService {
    constructor(private storage: LocalStorageService) {
        if (!isDemoDataEmptyMode()) {
            this.seed();
        }
    }

    list(): Trainer[] {
        return this.storage.get<Trainer[]>(TRAINERS_KEY, []);
    }

    add(trainer: Omit<Trainer, 'id' | 'fullName'>): Trainer {
        const created: Trainer = {
            ...trainer,
            id: crypto.randomUUID(),
            fullName: `${trainer.firstName} ${trainer.lastName}`.trim()
        };
        this.storage.set(TRAINERS_KEY, [created, ...this.list()]);
        return created;
    }

    getById(id: string): Trainer | undefined {
        return this.list().find((item) => item.id === id);
    }

    update(id: string, trainer: Omit<Trainer, 'id' | 'fullName'>): Trainer {
        const items = this.list();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error('Trainer not found');
        }
        const updated: Trainer = {
            ...items[index],
            ...trainer,
            id,
            fullName: `${trainer.firstName} ${trainer.lastName}`.trim()
        };
        items[index] = updated;
        this.storage.set(TRAINERS_KEY, items);
        return updated;
    }

    delete(id: string): void {
        this.storage.set(TRAINERS_KEY, this.list().filter((item) => item.id !== id));
    }

    private seed(): void {
        const existing = this.list();
        const demoStaff: Trainer[] = [
            {
                id: 'demo-staff-amit-shah',
                firstName: 'Amit',
                lastName: 'Shah',
                fullName: 'Amit Shah',
                role: 'Trainer',
                specialization: 'Strength Training',
                phone: '9876543210',
                email: 'amit.trainer@example.com',
                gender: 'Male',
                experienceYears: 7,
                salary: 42000,
                permissions: ['Members', 'Attendance', 'PT Sessions'],
                certifications: 'Certified Strength Coach',
                status: 'Active',
                notes: 'Focuses on hypertrophy and mobility improvement.'
            },
            {
                id: 'demo-staff-neha-singh',
                firstName: 'Neha',
                lastName: 'Singh',
                fullName: 'Neha Singh',
                role: 'Receptionist',
                specialization: 'Front Desk',
                phone: '9123456780',
                email: 'neha.trainer@example.com',
                gender: 'Female',
                experienceYears: 5,
                salary: 28000,
                permissions: ['Enquiries', 'Payments', 'Attendance'],
                certifications: 'Customer Experience Certified',
                status: 'Active',
                notes: 'Handles enquiries, payments, and check-ins.'
            },
            {
                id: 'demo-staff-ravi-kumar',
                firstName: 'Ravi',
                lastName: 'Kumar',
                fullName: 'Ravi Kumar',
                role: 'Manager',
                specialization: 'Operations',
                phone: '9012345678',
                email: 'ravi.trainer@example.com',
                gender: 'Male',
                experienceYears: 6,
                salary: 55000,
                permissions: ['Reports', 'Staff', 'Settings', 'Payments'],
                certifications: 'Fitness Operations Manager',
                status: 'On Leave',
                notes: 'Currently on leave until next week.'
            },
            {
                id: 'demo-staff-sanya-rao',
                firstName: 'Sanya',
                lastName: 'Rao',
                fullName: 'Sanya Rao',
                role: 'Trainer',
                specialization: 'Functional Fitness',
                phone: '9345678120',
                email: 'sanya.rao@example.com',
                gender: 'Female',
                experienceYears: 4,
                salary: 38000,
                permissions: ['Members', 'Attendance', 'PT Sessions'],
                certifications: 'Functional Movement Specialist',
                status: 'Active',
                notes: 'Runs evening HIIT and mobility classes.'
            },
            {
                id: 'demo-staff-maya-nair',
                firstName: 'Maya',
                lastName: 'Nair',
                fullName: 'Maya Nair',
                role: 'Trainer',
                specialization: 'Yoga & Wellness',
                phone: '9567812340',
                email: 'maya.nair@example.com',
                gender: 'Female',
                experienceYears: 8,
                salary: 46000,
                permissions: ['Members', 'Attendance', 'Group Classes'],
                certifications: 'Yoga Alliance RYT 500',
                status: 'Active',
                notes: 'Leads yoga, flexibility, and recovery programs.'
            },
            {
                id: 'demo-staff-karan-deshmukh',
                firstName: 'Karan',
                lastName: 'Deshmukh',
                fullName: 'Karan Deshmukh',
                role: 'Receptionist',
                specialization: 'Billing Desk',
                phone: '9456123789',
                email: 'karan.desk@example.com',
                gender: 'Male',
                experienceYears: 3,
                salary: 26000,
                permissions: ['Payments', 'Enquiries'],
                certifications: 'POS Billing Certified',
                status: 'Inactive',
                notes: 'Back-up billing desk operator.'
            },
            {
                id: 'demo-staff-priya-menon',
                firstName: 'Priya',
                lastName: 'Menon',
                fullName: 'Priya Menon',
                role: 'Trainer',
                specialization: 'Pilates',
                phone: '9800099901',
                email: 'priya.menon@example.com',
                gender: 'Female',
                experienceYears: 6,
                salary: 41000,
                permissions: ['Members', 'Attendance', 'Group Classes'],
                certifications: 'Pilates Mat Certified',
                status: 'Active',
                notes: 'Handles posture correction and core programs.'
            },
            {
                id: 'demo-staff-imran-khan',
                firstName: 'Imran',
                lastName: 'Khan',
                fullName: 'Imran Khan',
                role: 'Trainer',
                specialization: 'Boxing Conditioning',
                phone: '9800099902',
                email: 'imran.khan@example.com',
                gender: 'Male',
                experienceYears: 9,
                salary: 48000,
                permissions: ['Members', 'Attendance', 'PT Sessions'],
                certifications: 'Boxing Coach Level 2',
                status: 'Active',
                notes: 'Popular for fat-loss conditioning plans.'
            },
            {
                id: 'demo-staff-lata-iyer',
                firstName: 'Lata',
                lastName: 'Iyer',
                fullName: 'Lata Iyer',
                role: 'Receptionist',
                specialization: 'Member Support',
                phone: '9800099903',
                email: 'lata.iyer@example.com',
                gender: 'Female',
                experienceYears: 4,
                salary: 30000,
                permissions: ['Members', 'Enquiries', 'Notifications'],
                certifications: 'Front Office Operations',
                status: 'Active',
                notes: 'Owns member onboarding calls.'
            },
            {
                id: 'demo-staff-vikram-sethi',
                firstName: 'Vikram',
                lastName: 'Sethi',
                fullName: 'Vikram Sethi',
                role: 'Manager',
                specialization: 'Sales & Retention',
                phone: '9800099904',
                email: 'vikram.sethi@example.com',
                gender: 'Male',
                experienceYears: 10,
                salary: 62000,
                permissions: ['Reports', 'Members', 'Payments', 'Offers'],
                certifications: 'Sales Leadership',
                status: 'Active',
                notes: 'Tracks churn, renewals, and offer performance.'
            },
            {
                id: 'demo-staff-anjali-patel',
                firstName: 'Anjali',
                lastName: 'Patel',
                fullName: 'Anjali Patel',
                role: 'Trainer',
                specialization: 'Zumba',
                phone: '9800099905',
                email: 'anjali.patel@example.com',
                gender: 'Female',
                experienceYears: 5,
                salary: 36000,
                permissions: ['Attendance', 'Group Classes'],
                certifications: 'Zumba Instructor',
                status: 'On Leave',
                notes: 'On planned leave for demo status filtering.'
            },
            {
                id: 'demo-staff-rahul-bose',
                firstName: 'Rahul',
                lastName: 'Bose',
                fullName: 'Rahul Bose',
                role: 'Trainer',
                specialization: 'Sports Rehab',
                phone: '9800099906',
                email: 'rahul.bose@example.com',
                gender: 'Male',
                experienceYears: 8,
                salary: 45000,
                permissions: ['Members', 'Attendance', 'PT Sessions'],
                certifications: 'Corrective Exercise Specialist',
                status: 'Inactive',
                notes: 'Inactive record for archive and status validation.'
            }
        ];

        const byEmail = new Set(existing.map((staff) => staff.email.toLowerCase()));
        const missing = demoStaff.filter((staff) => !byEmail.has(staff.email.toLowerCase()));

        if (!missing.length) {
            return;
        }

        this.storage.set<Trainer[]>(TRAINERS_KEY, [...existing, ...missing]);
    }
}
