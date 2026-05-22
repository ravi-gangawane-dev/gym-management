import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TrainerService } from '../../../../core/services/trainer.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Trainer } from '../../../../core/models/trainer.model';
import { AppConfirmationService } from '../../../../shared/services/app-confirmation.service';

@Component({
    selector: 'app-trainer-details',
    standalone: true,
    imports: [CommonModule, ButtonModule, MessageModule],
    templateUrl: './trainer-details.component.html',
    styleUrls: ['./trainer-details.component.scss']
})
export class TrainerDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private trainerService = inject(TrainerService);
    private confirmation = inject(AppConfirmationService);
    private toast = inject(ToastService);

    trainer: Trainer | null = null;

    ngOnInit(): void {
        const trainerId = this.route.snapshot.paramMap.get('id');
        if (!trainerId) {
            this.router.navigateByUrl('/staff');
            return;
        }

        this.trainer = this.trainerService.getById(trainerId) ?? null;
        if (!this.trainer) {
            this.toast.error('Staff Not Found', 'Unable to find the requested staff member.');
            this.router.navigateByUrl('/staff');
        }
    }

    editTrainer(): void {
        if (this.trainer) {
            this.router.navigate(['/staff/edit', this.trainer.id]);
        }
    }

    deleteTrainer(): void {
        if (!this.trainer) {
            return;
        }

        this.confirmation.permanentDelete({
            name: this.trainer.fullName,
            accept: () => {
                this.trainerService.delete(this.trainer!.id);
                this.toast.success('Staff Deleted', 'Staff member has been removed successfully.');
                this.router.navigateByUrl('/staff');
            }
        });
    }

    goBack(): void {
        this.router.navigateByUrl('/staff');
    }
}
