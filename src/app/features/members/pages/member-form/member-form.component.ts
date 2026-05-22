import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule } from 'primeng/editor';
import { MemberService } from '../../../../core/services/member.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Member } from '../../../../core/models/member.model';
import { PlanService } from '../../../../core/services/plan.service';
import { TrainerService } from '../../../../core/services/trainer.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    RadioButtonModule,
    SelectModule,
    TextareaModule,
    EditorModule
  ],
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private memberService = inject(MemberService);
  private planService = inject(PlanService);
  private trainerService = inject(TrainerService);
  private toast = inject(ToastService);
  private router = inject(Router);

  planOptions = this.planService.list().map((plan) => plan.name);
  trainerOptions = this.trainerService
    .list()
    .filter((trainer) => trainer.role === 'Trainer' && trainer.status === 'Active')
    .map((trainer) => trainer.fullName);
  today = new Date();
  text = '';
  photoPreviewUrl = '';
  photoFileName = '';
  idPreviewUrl = '';
  idFileName = '';
  idIsImage = false;
  mode: 'add' | 'edit' = 'add';
  memberId: string | null = null;
  lastCreatedMember: Member | null = null;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    designation: [''],
    phone: ['', Validators.required],
    email: [''],
    gender: ['Male', Validators.required],
    dob: [this.today, Validators.required],
    address: ['', Validators.required],
    planName: [this.planOptions[0] || '', Validators.required],
    startDate: [this.today, Validators.required],
    duration: [1, [Validators.required, Validators.min(1)]],
    trainer: ['', Validators.required],
    emergencyContact: ['', Validators.required],
    photo: [''],
    govId: [''],
    notes: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawValue = this.form.getRawValue();
    const payload: Omit<Member, 'id'> = {
      ...rawValue,
      firstName: rawValue.firstName ?? '',
      lastName: rawValue.lastName ?? '',
      designation: rawValue.designation ?? '',
      phone: rawValue.phone ?? '',
      email: rawValue.email ?? '',
      gender: rawValue.gender ?? '',
      dob: this.toIsoDate(rawValue.dob),
      address: rawValue.address ?? '',
      planName: rawValue.planName ?? '',
      startDate: this.toIsoDate(rawValue.startDate),
      duration: rawValue.duration ?? 1,
      trainer: rawValue.trainer ?? '',
      emergencyContact: rawValue.emergencyContact ?? '',
      photo: rawValue.photo ?? '',
      govId: rawValue.govId ?? '',
      notes: rawValue.notes ?? '',
      fullName: `${rawValue.firstName ?? ''} ${rawValue.lastName ?? ''}`.trim(),
      active:
        this.mode === 'edit' && this.memberId
          ? this.memberService.getById(this.memberId)?.active ?? true
          : true
    };
    try {
      if (this.mode === 'edit' && this.memberId) {
        this.memberService.update(this.memberId, payload);
        this.toast.success('Member Updated', 'Member details have been updated');
        this.router.navigateByUrl('/members');
      } else {
        this.lastCreatedMember = this.memberService.add(payload);
        this.toast.success('Member Added', 'Member has been saved');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.toast.error('Storage Full', 'Please remove older large member photos or use a smaller image.');
        return;
      }

      throw error;
    }
  }

  onFileSelected(event: Event, field: 'photo' | 'govId'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) {
      return;
    }

    if (field === 'photo') {
      this.revokeObjectUrl(this.photoPreviewUrl);
      this.photoFileName = file.name;
      this.photoPreviewUrl = URL.createObjectURL(file);
      this.setImageThumbnail(file, 'photo', 160, 0.72);
      return;
    }

    this.revokeObjectUrl(this.idPreviewUrl);
    this.idFileName = file.name;
    this.idIsImage = file.type.startsWith('image/');
    this.idPreviewUrl = this.idIsImage ? URL.createObjectURL(file) : '';

    if (this.idIsImage) {
      this.setImageThumbnail(file, 'govId', 220, 0.68);
      return;
    }

    this.form.controls.govId.setValue(file.name);
  }

  cancel(): void {
    this.router.navigateByUrl('/members');
  }

  goToPayment(): void {
    if (!this.lastCreatedMember) {
      return;
    }

    this.router.navigate(['/payments/add'], {
      queryParams: {
        memberId: this.lastCreatedMember.id,
        member: this.lastCreatedMember.fullName,
        plan: this.lastCreatedMember.planName
      }
    });
  }

  ngOnInit(): void {
    this.loadMemberIfNeeded();
    this.prefillFromLead();
    this.syncDurationWithSelectedPlan();
    this.form.controls.planName.valueChanges.subscribe(() => this.syncDurationWithSelectedPlan());
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl(this.photoPreviewUrl);
    this.revokeObjectUrl(this.idPreviewUrl);
  }

  private loadMemberIfNeeded(): void {
    const memberId = this.route.snapshot.paramMap.get('id');
    if (!memberId) {
      return;
    }

    const member = this.memberService.getById(memberId);
    if (!member) {
      this.toast.error('Member Not Found', 'Unable to find the requested member.');
      this.router.navigateByUrl('/members');
      return;
    }

    this.memberId = memberId;
    this.mode = 'edit';
    this.text = member.notes;

    this.form.patchValue({
      firstName: member.firstName,
      lastName: member.lastName,
      designation: member.designation,
      phone: member.phone,
      email: member.email,
      gender: member.gender,
      dob: member.dob ? new Date(member.dob) : this.today,
      address: member.address,
      planName: member.planName,
      trainer: member.trainer,
      startDate: member.startDate ? new Date(member.startDate) : this.today,
      duration: member.duration,
      emergencyContact: member.emergencyContact,
      photo: member.photo,
      govId: member.govId,
      notes: member.notes
    });

    if (member.photo) {
      this.photoPreviewUrl = member.photo;
    }

    if (member.govId) {
      this.idFileName = member.govId;
      this.idIsImage = this.isImageUrl(member.govId);
      this.idPreviewUrl = this.idIsImage ? member.govId : '';
      if (!this.idIsImage) {
        this.form.controls.govId.setValue(member.govId);
      }
    }
  }

  private prefillFromLead(): void {
    if (this.mode !== 'add') {
      return;
    }

    const query = this.route.snapshot.queryParamMap;
    const name = query.get('name') ?? '';
    const [firstName, ...lastNameParts] = name.split(/\s+/).filter(Boolean);

    this.form.patchValue({
      firstName: firstName ?? '',
      lastName: lastNameParts.join(' '),
      phone: query.get('phone') ?? '',
      email: query.get('email') ?? '',
      notes: query.get('source') ? `Converted from ${query.get('source')} enquiry.` : ''
    });
  }

  private syncDurationWithSelectedPlan(): void {
    const selectedPlan = this.planService.list().find((plan) => plan.name === this.form.controls.planName.value);
    if (!selectedPlan) {
      return;
    }

    this.form.controls.duration.setValue(selectedPlan.durationMonths, { emitEvent: false });
  }

  private isImageUrl(url: string): boolean {
    return !!url && (url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url));
  }

  private toIsoDate(value: Date | string | null | undefined): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }

    return value ? String(value) : '';
  }

  private revokeObjectUrl(url: string): void {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  private setImageThumbnail(file: File, field: 'photo' | 'govId', maxSize: number, quality: number): void {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      this.form.controls[field].setValue(canvas.toDataURL('image/jpeg', quality));
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      this.form.controls[field].setValue(file.name);
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  }
}
