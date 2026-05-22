import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastService } from '../../../../shared/services/toast.service';
import { EnquiryService } from '../../../../core/services/enquiry.service';
import { Enquiry, EnquiryPriority, EnquirySource, EnquiryStatus } from '../../../../core/models/enquiry.model';

@Component({
    selector: 'app-edit-enquiry',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, DatePickerModule, SelectModule, TextareaModule],
    templateUrl: './edit-enquiry.component.html',
    styleUrls: ['./edit-enquiry.component.scss']
})
export class EditEnquiryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toast = inject(ToastService);
    private enquiryService = inject(EnquiryService);

    productOptions = ['Membership', 'Personal Training', 'Nutrition Plan', 'Online Coaching'];
    priorityOptions: EnquiryPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
    sourceOptions: EnquirySource[] = ['Website', 'Phone', 'Email', 'Referral', 'Walk-in'];
    assignedUsers = ['Amit', 'Neha', 'Ravi', 'Sanya', 'Maya'];

    enquiry: Enquiry | null = null;
    attachments: { id: string; name: string; url: string; type: string }[] = [];

    form = this.fb.group({
        customerName: ['', Validators.required],
        contactNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        company: [''],
        productService: ['', Validators.required],
        priority: ['Medium', Validators.required],
        status: ['New' as EnquiryStatus, Validators.required],
        source: ['Website' as EnquirySource, Validators.required],
        assignedTo: ['', Validators.required],
        remarks: [''],
        notes: ['']
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigateByUrl('/enquiries');
            return;
        }

        const enquiry = this.enquiryService.getById(id);
        if (!enquiry) {
            this.toast.error('Enquiry not found', 'Unable to load enquiry');
            this.router.navigateByUrl('/enquiries');
            return;
        }

        this.enquiry = enquiry;
        this.attachments = enquiry.attachments;
        this.form.patchValue({
            customerName: enquiry.customerName,
            contactNumber: enquiry.contactNumber,
            email: enquiry.email,
            company: enquiry.company,
            productService: enquiry.productService,
            priority: enquiry.priority,
            status: enquiry.status,
            source: enquiry.source,
            assignedTo: enquiry.assignedTo,
            remarks: enquiry.remarks,
            notes: enquiry.notes
        });
    }

    submit(): void {
        if (!this.enquiry) {
            return;
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const values = this.form.value as {
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
        };

        this.enquiryService.update(this.enquiry.id, {
            customerName: values.customerName,
            contactNumber: values.contactNumber,
            email: values.email,
            company: values.company,
            productService: values.productService,
            priority: values.priority,
            status: values.status,
            source: values.source,
            assignedTo: values.assignedTo,
            remarks: values.remarks,
            notes: values.notes,
            attachments: this.attachments
        });

        this.toast.success('Enquiry Updated', 'Enquiry details were updated successfully.');
        this.router.navigateByUrl('/enquiries');
    }

    cancel(): void {
        this.router.navigateByUrl('/enquiries');
    }

    onAttachmentsSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        if (!files.length) {
            return;
        }

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                this.attachments.push({
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: file.type,
                    url: String(reader.result)
                });
            };
            reader.readAsDataURL(file);
        });

        input.value = '';
    }

    removeAttachment(id: string): void {
        this.attachments = this.attachments.filter((attachment) => attachment.id !== id);
    }
}
