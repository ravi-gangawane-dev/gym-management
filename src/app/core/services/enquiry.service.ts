import { Injectable, computed, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import {
    Enquiry,
    EnquiryAttachment,
    EnquiryFollowUp,
    EnquiryStatus,
    EnquiryTimelineEvent,
    EnquiryPriority,
    EnquirySource
} from '../models/enquiry.model';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const ENQUIRIES_KEY = 'gym_enquiries';

@Injectable({ providedIn: 'root' })
export class EnquiryService {
    private enquiriesSignal = signal<Enquiry[]>([]);
    readonly enquiries = computed(() => this.enquiriesSignal());

    constructor(private storage: LocalStorageService) {
        this.loadInitialData();
    }

    private loadInitialData(): void {
        const data = isDemoDataEmptyMode() ? this.loadEnquiries() : this.seedEnquiries(this.loadEnquiries());
        this.enquiriesSignal.set(data);
        this.storage.set(ENQUIRIES_KEY, data);
    }

    list(includeDeleted = false): Enquiry[] {
        return this.enquiries().filter((enquiry) => includeDeleted || !enquiry.deleted);
    }

    getById(id: string): Enquiry | undefined {
        return this.list().find((enquiry) => enquiry.id === id);
    }

    create(payload: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'followUps' | 'timeline'>): Enquiry {
        const now = new Date().toISOString();
        const enquiry: Enquiry = {
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            deleted: false,
            followUps: [],
            timeline: [
                {
                    id: crypto.randomUUID(),
                    type: 'created',
                    title: 'Enquiry Created',
                    details: `Created by ${payload.assignedTo}`,
                    timestamp: now,
                    user: payload.assignedTo
                }
            ],
            ...payload
        };

        this.enquiriesSignal.update((items) => [enquiry, ...items]);
        this.commit();
        return enquiry;
    }

    update(id: string, payload: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'followUps' | 'timeline'>): Enquiry {
        const enquiry = this.getById(id);
        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        const now = new Date().toISOString();
        const updated: Enquiry = {
            ...enquiry,
            ...payload,
            updatedAt: now,
            timeline: [
                ...enquiry.timeline,
                {
                    id: crypto.randomUUID(),
                    type: 'updated',
                    title: 'Enquiry Updated',
                    details: `Updated by ${payload.assignedTo}`,
                    timestamp: now,
                    user: payload.assignedTo
                }
            ]
        };

        this.enquiriesSignal.update((items) => items.map((item) => (item.id === id ? updated : item)));
        this.commit();
        return updated;
    }

    softDelete(id: string): void {
        const enquiry = this.getById(id);
        if (!enquiry) {
            return;
        }

        const now = new Date().toISOString();
        this.enquiriesSignal.update((items) =>
            items.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        deleted: true,
                        updatedAt: now,
                        timeline: [
                            ...item.timeline,
                            {
                                id: crypto.randomUUID(),
                                type: 'status',
                                title: 'Enquiry Deleted',
                                details: `Moved to deleted state by ${item.assignedTo}`,
                                timestamp: now,
                                user: item.assignedTo
                            }
                        ]
                    }
                    : item
            )
        );
        this.commit();
    }

    restore(id: string): void {
        const enquiry = this.list(true).find((item) => item.id === id);
        if (!enquiry) {
            return;
        }

        const now = new Date().toISOString();
        this.enquiriesSignal.update((items) =>
            items.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        deleted: false,
                        updatedAt: now,
                        timeline: [
                            ...item.timeline,
                            {
                                id: crypto.randomUUID(),
                                type: 'status',
                                title: 'Enquiry Restored',
                                details: `Restored from archive by ${item.assignedTo}`,
                                timestamp: now,
                                user: item.assignedTo
                            }
                        ]
                    }
                    : item
            )
        );
        this.commit();
    }

    permanentDelete(id: string): void {
        this.enquiriesSignal.update((items) => items.filter((item) => item.id !== id));
        this.commit();
    }

    addFollowUp(enquiryId: string, followUpPayload: Omit<EnquiryFollowUp, 'id' | 'createdAt' | 'createdBy' | 'enquiryId'>): EnquiryFollowUp {
        const enquiry = this.getById(enquiryId);
        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        const now = new Date().toISOString();
        const followUp: EnquiryFollowUp = {
            id: crypto.randomUUID(),
            enquiryId,
            createdAt: now,
            createdBy: enquiry.assignedTo,
            ...followUpPayload
        };

        const updated: Enquiry = {
            ...enquiry,
            followUps: [...enquiry.followUps, followUp],
            updatedAt: now,
            timeline: [
                ...enquiry.timeline,
                {
                    id: crypto.randomUUID(),
                    type: 'followup',
                    title: 'Follow-up Added',
                    details: followUpPayload.note,
                    timestamp: now,
                    user: enquiry.assignedTo
                }
            ]
        };

        this.enquiriesSignal.update((items) => items.map((item) => (item.id === enquiryId ? updated : item)));
        this.commit();
        return followUp;
    }

    changeStatus(id: string, status: EnquiryStatus): Enquiry {
        const enquiry = this.getById(id);
        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        const now = new Date().toISOString();
        const updated: Enquiry = {
            ...enquiry,
            status,
            updatedAt: now,
            timeline: [
                ...enquiry.timeline,
                {
                    id: crypto.randomUUID(),
                    type: 'status',
                    title: 'Status Changed',
                    details: `Status updated to ${status}`,
                    timestamp: now,
                    user: enquiry.assignedTo
                }
            ]
        };

        this.enquiriesSignal.update((items) => items.map((item) => (item.id === id ? updated : item)));
        this.commit();
        return updated;
    }

    getStatusBadge(status: EnquiryStatus): { label: string; severity: string } {
        const map: Record<EnquiryStatus, { label: string; severity: string }> = {
            New: { label: 'new', severity: 'info' },
            'In Progress': { label: 'in-progress', severity: 'warning' },
            'Follow-Up': { label: 'follow-up', severity: 'success' },
            Converted: { label: 'converted', severity: 'success' },
            Closed: { label: 'closed', severity: 'success' },
            Rejected: { label: 'rejected', severity: 'danger' }
        };
        return map[status];
    }

    private commit(): void {
        this.storage.set(ENQUIRIES_KEY, this.enquiries());
    }

    private loadEnquiries(): Enquiry[] {
        return this.storage.get<Enquiry[]>(ENQUIRIES_KEY, []);
    }

    private seedEnquiries(existing: Enquiry[]): Enquiry[] {
        const demos = [
            this.enquiry('demo-enquiry-001', 'Nikhil Patil', '9876500001', 'nikhil.patil@example.com', 'Membership', 'High', 'New', 'Website', 'Amit', -1, 'Interested in Annual Elite plan.'),
            this.enquiry('demo-enquiry-002', 'Sara Fernandes', '9876500002', 'sara.fernandes@example.com', 'Personal Training', 'Urgent', 'Follow-Up', 'Referral', 'Neha', -3, 'Wants PT trial this week.'),
            this.enquiry('demo-enquiry-003', 'Manav Shah', '9876500003', 'manav.shah@example.com', 'Nutrition Plan', 'Medium', 'In Progress', 'Phone', 'Ravi', -5, 'Asked for diet consultation pricing.'),
            this.enquiry('demo-enquiry-004', 'Ritika Bose', '9876500004', 'ritika.bose@example.com', 'Online Coaching', 'Low', 'Closed', 'Email', 'Sanya', -9, 'Remote coaching request closed after quote.'),
            this.enquiry('demo-enquiry-005', 'Harsh Mehta', '9876500005', 'harsh.mehta@example.com', 'Membership', 'High', 'Converted', 'Walk-in', 'Maya', -12, 'Converted to Gold membership.'),
            this.enquiry('demo-enquiry-006', 'Irfan Ali', '9876500006', 'irfan.ali@example.com', 'Personal Training', 'Medium', 'Rejected', 'Website', 'Amit', -15, 'Budget mismatch.'),
            this.enquiry('demo-enquiry-007', 'Sneha Kulkarni', '9876500007', 'sneha.kulkarni@example.com', 'Membership', 'Medium', 'Follow-Up', 'Phone', 'Neha', -2, 'Follow up for family plan discount.'),
            this.enquiry('demo-enquiry-008', 'Omkar Joshi', '9876500008', 'omkar.joshi@example.com', 'Nutrition Plan', 'High', 'New', 'Referral', 'Ravi', 0, 'Interested in transformation package.'),
            this.enquiry('demo-enquiry-009', 'Diya Shah', '9876500009', 'diya.shah@example.com', 'Membership', 'Urgent', 'New', 'Walk-in', 'Lata', -1, 'Wants immediate joining with annual offer.'),
            this.enquiry('demo-enquiry-010', 'Pranav Rao', '9876500010', 'pranav.rao@example.com', 'Personal Training', 'High', 'In Progress', 'Website', 'Imran', -4, 'Asked for boxing conditioning trial.'),
            this.enquiry('demo-enquiry-011', 'Naina Gill', '9876500011', 'naina.gill@example.com', 'Online Coaching', 'Medium', 'Follow-Up', 'Email', 'Priya', -6, 'Needs online plan with weekly review.'),
            this.enquiry('demo-enquiry-012', 'Rudra Kale', '9876500012', 'rudra.kale@example.com', 'Membership', 'Low', 'Closed', 'Phone', 'Karan', -11, 'Closed after location mismatch.'),
            this.enquiry('demo-enquiry-013', 'Mira Das', '9876500013', 'mira.das@example.com', 'Nutrition Plan', 'Medium', 'Converted', 'Referral', 'Maya', -13, 'Converted to diet consultation add-on.'),
            this.enquiry('demo-enquiry-014', 'Aryan Nanda', '9876500014', 'aryan.nanda@example.com', 'Membership', 'High', 'Rejected', 'Website', 'Vikram', -16, 'Rejected after price comparison.'),
            this.enquiry('demo-enquiry-015', 'Kavya Bhat', '9876500015', 'kavya.bhat@example.com', 'Personal Training', 'Urgent', 'Follow-Up', 'Walk-in', 'Amit', -3, 'PT slot availability requested.'),
            this.enquiry('demo-enquiry-016', 'Samar Jain', '9876500016', 'samar.jain@example.com', 'Membership', 'Medium', 'In Progress', 'Phone', 'Neha', -7, 'Comparing Gold and Platinum plans.'),
            this.enquiry('demo-enquiry-017', 'Esha Pillai', '9876500017', 'esha.pillai@example.com', 'Online Coaching', 'Low', 'New', 'Email', 'Sanya', -2, 'Remote yoga enquiry.'),
            this.enquiry('demo-enquiry-018', 'Varun Wagle', '9876500018', 'varun.wagle@example.com', 'Membership', 'High', 'Converted', 'Referral', 'Ravi', -18, 'Converted through corporate wellness lead.'),
            this.enquiry('demo-enquiry-019', 'Pallavi Roy', '9876500019', 'pallavi.roy@example.com', 'Nutrition Plan', 'Medium', 'Follow-Up', 'Website', 'Maya', -8, 'Follow-up after BMI assessment.'),
            this.enquiry('demo-enquiry-020', 'Chirag Shah', '9876500020', 'chirag.shah@example.com', 'Personal Training', 'High', 'New', 'Walk-in', 'Imran', 0, 'Asked for transformation result photos.'),
            this.enquiry('demo-enquiry-021', 'Reema Kaur', '9876500021', 'reema.kaur@example.com', 'Membership', 'Low', 'Closed', 'Phone', 'Lata', -20, 'Closed after no response.'),
            this.enquiry('demo-enquiry-022', 'Abhay Singh', '9876500022', 'abhay.singh@example.com', 'Personal Training', 'Urgent', 'In Progress', 'Referral', 'Amit', -5, 'Needs morning PT slot.'),
            this.enquiry('demo-enquiry-023', 'Jhanvi Desai', '9876500023', 'jhanvi.desai@example.com', 'Membership', 'Medium', 'Rejected', 'Email', 'Vikram', -21, 'Rejected due to moving city.'),
            this.enquiry('demo-enquiry-024', 'Tejas Bendre', '9876500024', 'tejas.bendre@example.com', 'Nutrition Plan', 'High', 'Converted', 'Website', 'Maya', -9, 'Converted to PT Transformation package.')
        ];

        const byId = new Set(existing.map((enquiry) => enquiry.id));
        const missing = demos.filter((enquiry) => !byId.has(enquiry.id));
        return [...existing, ...missing];
    }

    private enquiry(
        id: string,
        customerName: string,
        contactNumber: string,
        email: string,
        productService: string,
        priority: EnquiryPriority,
        status: EnquiryStatus,
        source: EnquirySource,
        assignedTo: string,
        dayOffset: number,
        notes: string
    ): Enquiry {
        const created = new Date();
        created.setDate(created.getDate() + dayOffset);
        const updated = new Date(created);
        updated.setHours(updated.getHours() + 4);

        const followUps: EnquiryFollowUp[] =
            status === 'Follow-Up'
                ? [
                    {
                        id: `${id}-followup-1`,
                        enquiryId: id,
                        note: 'Call back scheduled with membership counsellor.',
                        nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        createdAt: updated.toISOString(),
                        createdBy: assignedTo,
                        outcome: 'Pending'
                    }
                ]
                : [];

        const timeline: EnquiryTimelineEvent[] = [
            {
                id: `${id}-timeline-created`,
                type: 'created',
                title: 'Enquiry Created',
                details: `Created by ${assignedTo}`,
                timestamp: created.toISOString(),
                user: assignedTo
            },
            {
                id: `${id}-timeline-status`,
                type: 'status',
                title: 'Status Updated',
                details: `Status set to ${status}`,
                timestamp: updated.toISOString(),
                user: assignedTo
            }
        ];

        if (followUps.length) {
            timeline.push({
                id: `${id}-timeline-followup`,
                type: 'followup',
                title: 'Follow-up Added',
                details: followUps[0].note,
                timestamp: followUps[0].createdAt,
                user: assignedTo
            });
        }

        return {
            id,
            customerName,
            contactNumber,
            email,
            company: '',
            productService,
            priority,
            status,
            source,
            assignedTo,
            remarks: notes,
            notes,
            createdAt: created.toISOString(),
            updatedAt: updated.toISOString(),
            deleted: false,
            attachments: [],
            followUps,
            timeline
        };
    }
}
