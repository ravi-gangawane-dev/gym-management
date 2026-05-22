import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EnquiryService } from '../../../../core/services/enquiry.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FollowUpDialogComponent } from '../../components/follow-up-dialog/follow-up-dialog.component';
import { FollowUpTimelineComponent } from '../../components/follow-up-timeline/follow-up-timeline.component';
import { Enquiry, EnquiryStatus } from '../../../../core/models/enquiry.model';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

@Component({
    selector: 'app-enquiry-details',
    standalone: true,
    imports: [CommonModule, RouterLink, ButtonModule, TagModule, FollowUpDialogComponent, FollowUpTimelineComponent],
    templateUrl: './enquiry-details.component.html',
    styleUrls: ['./enquiry-details.component.scss']
})
export class EnquiryDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private enquiryService = inject(EnquiryService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);

    enquiry: Enquiry | null = null;
    followUpDialogVisible = false;
    statuses: EnquiryStatus[] = ['New', 'In Progress', 'Follow-Up', 'Converted', 'Closed', 'Rejected'];

    ngOnInit(): void {
        this.loadEnquiry();
    }

    private loadEnquiry(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigateByUrl('/enquiries');
            return;
        }

        const enquiry = this.enquiryService.getById(id);
        if (!enquiry) {
            this.toast.error('Enquiry not found', 'Unable to load enquiry details.');
            this.router.navigateByUrl('/enquiries');
            return;
        }

        this.enquiry = enquiry;
    }

    goBack(): void {
        this.router.navigateByUrl('/enquiries');
    }

    deleteEnquiry(): void {
        if (!this.enquiry) {
            return;
        }

        this.confirmation.archive({
            message: 'Are you sure you want to archive this enquiry? It will be moved to the deleted state.',
            accept: () => {
                this.enquiryService.softDelete(this.enquiry!.id);
                this.toast.success('Enquiry Archived', 'The enquiry has been archived.');
                this.router.navigateByUrl('/enquiries');
            }
        });
    }

    convertToMember(): void {
        if (!this.enquiry) {
            return;
        }

        this.enquiryService.changeStatus(this.enquiry.id, 'Converted');
        this.router.navigate(['/members/add'], {
            queryParams: {
                name: this.enquiry.customerName,
                phone: this.enquiry.contactNumber,
                email: this.enquiry.email,
                source: 'follow-up'
            }
        });
    }

    openFollowUpDialog(): void {
        this.followUpDialogVisible = true;
    }

    onFollowUpSave(payload: { note: string; nextFollowUpAt: string; outcome: string }): void {
        if (!this.enquiry) {
            return;
        }
        this.enquiryService.addFollowUp(this.enquiry.id, {
            note: payload.note,
            outcome: payload.outcome,
            nextFollowUpAt: payload.nextFollowUpAt || ''
        });
        this.toast.success('Follow-Up Added', 'The follow-up was added successfully.');
        this.loadEnquiry();
    }

    onStatusChange(status: EnquiryStatus): void {
        if (!this.enquiry || this.enquiry.status === status) {
            return;
        }
        this.enquiryService.changeStatus(this.enquiry.id, status);
        this.toast.success('Status Updated', `Status changed to ${status}.`);
        this.loadEnquiry();
    }
}
