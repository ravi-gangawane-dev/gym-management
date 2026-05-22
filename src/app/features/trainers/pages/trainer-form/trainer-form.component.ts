import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TrainerService } from '../../../../core/services/trainer.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Trainer } from '../../../../core/models/trainer.model';

@Component({
    selector: 'app-trainer-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, SelectModule, TextareaModule, ButtonModule],
    templateUrl: './trainer-form.component.html',
    styleUrls: ['./trainer-form.component.scss']
})
export class TrainerFormComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private trainerService = inject(TrainerService);
    private toast = inject(ToastService);

    mode: 'add' | 'edit' = 'add';
    trainerId: string | null = null;
    photoPreviewUrl = '';
    photoFileName = '';

    statusOptions: Trainer['status'][] = ['Active', 'Inactive', 'On Leave'];
    genderOptions: Trainer['gender'][] = ['Male', 'Female', 'Other'];
    roleOptions: Array<NonNullable<Trainer['role']>> = ['Trainer', 'Receptionist', 'Manager'];
    specializationOptions = ['Strength Training', 'Yoga & Wellness', 'Functional Fitness', 'Cardio Coaching', 'Nutrition', 'Front Desk', 'Operations', 'Sales'];

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        role: ['Trainer' as NonNullable<Trainer['role']>, Validators.required],
        specialization: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        gender: ['Male' as Trainer['gender'], Validators.required],
        experienceYears: [1, [Validators.required, Validators.min(0)]],
        salary: [30000, [Validators.required, Validators.min(0)]],
        permissions: ['Members, Attendance'],
        photo: [''],
        certifications: [''],
        status: ['Active' as Trainer['status'], Validators.required],
        notes: ['']
    });

    ngOnInit(): void {
        this.loadTrainer();
    }

    ngOnDestroy(): void {
        if (this.photoPreviewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(this.photoPreviewUrl);
        }
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const rawValue = this.form.getRawValue();
        const payload: Omit<Trainer, 'id' | 'fullName'> = {
            firstName: rawValue.firstName ?? '',
            lastName: rawValue.lastName ?? '',
            role: (rawValue.role ?? 'Trainer') as NonNullable<Trainer['role']>,
            specialization: rawValue.specialization ?? '',
            phone: rawValue.phone ?? '',
            email: rawValue.email ?? '',
            gender: (rawValue.gender ?? 'Male') as Trainer['gender'],
            experienceYears: rawValue.experienceYears ?? 0,
            salary: rawValue.salary ?? 0,
            permissions: this.toPermissions(rawValue.permissions ?? ''),
            photo: rawValue.photo ?? '',
            certifications: rawValue.certifications ?? '',
            status: (rawValue.status ?? 'Active') as Trainer['status'],
            notes: rawValue.notes ?? ''
        };

        if (this.mode === 'edit' && this.trainerId) {
            this.trainerService.update(this.trainerId, payload);
            this.toast.success('Staff Updated', 'Staff details were updated successfully.');
        } else {
            this.trainerService.add(payload);
            this.toast.success('Staff Added', 'New staff member has been added successfully.');
        }

        this.router.navigateByUrl('/staff');
    }

    cancel(): void {
        this.router.navigateByUrl('/staff');
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.item(0);
        if (!file) {
            return;
        }

        if (this.photoPreviewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(this.photoPreviewUrl);
        }

        this.photoFileName = file.name;
        this.photoPreviewUrl = URL.createObjectURL(file);
        this.setImageThumbnail(file);
    }

    private loadTrainer(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            return;
        }

        const trainer = this.trainerService.getById(id);
        if (!trainer) {
            this.toast.error('Staff Not Found', 'Unable to find the staff member with the requested id.');
            this.router.navigateByUrl('/staff');
            return;
        }

        this.trainerId = id;
        this.mode = 'edit';
        this.form.patchValue({
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            role: trainer.role ?? 'Trainer',
            specialization: trainer.specialization,
            phone: trainer.phone,
            email: trainer.email,
            gender: trainer.gender,
            experienceYears: trainer.experienceYears,
            salary: trainer.salary ?? 30000,
            permissions: trainer.permissions?.join(', ') ?? 'Members, Attendance',
            photo: trainer.photo ?? '',
            certifications: trainer.certifications,
            status: trainer.status,
            notes: trainer.notes
        });

        this.photoPreviewUrl = trainer.photo ?? '';
    }

    private toPermissions(value: string): string[] {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    private setImageThumbnail(file: File): void {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            const scale = Math.min(1, 220 / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
            this.form.controls.photo.setValue(canvas.toDataURL('image/jpeg', 0.72));
            URL.revokeObjectURL(objectUrl);
        };

        image.onerror = () => {
            this.form.controls.photo.setValue('');
            URL.revokeObjectURL(objectUrl);
        };

        image.src = objectUrl;
    }
}
