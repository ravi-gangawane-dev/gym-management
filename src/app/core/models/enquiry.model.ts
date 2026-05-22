export type EnquiryStatus = 'New' | 'In Progress' | 'Follow-Up' | 'Converted' | 'Closed' | 'Rejected';
export type EnquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type EnquirySource = 'Website' | 'Phone' | 'Email' | 'Referral' | 'Walk-in';

export interface EnquiryAttachment {
    id: string;
    name: string;
    type: string;
    url: string;
}

export interface EnquiryFollowUp {
    id: string;
    enquiryId: string;
    note: string;
    nextFollowUpAt: string;
    createdAt: string;
    createdBy: string;
    outcome: string;
}

export interface EnquiryTimelineEvent {
    id: string;
    type: 'created' | 'updated' | 'status' | 'followup' | 'assigned' | 'comment';
    title: string;
    details: string;
    timestamp: string;
    user: string;
}

export interface Enquiry {
    id: string;
    customerName: string;
    contactNumber: string;
    email: string;
    company: string;
    productService: string;
    priority: EnquiryPriority;
    status: EnquiryStatus;
    source: EnquirySource;
    assignedTo: string;
    remarks: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
    deleted?: boolean;
    attachments: EnquiryAttachment[];
    followUps: EnquiryFollowUp[];
    timeline: EnquiryTimelineEvent[];
}
