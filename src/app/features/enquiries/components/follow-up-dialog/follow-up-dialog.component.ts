import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-follow-up-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, DatePickerModule, InputTextModule, TextareaModule],
    templateUrl: './follow-up-dialog.component.html',
    styleUrls: ['./follow-up-dialog.component.scss']
})
export class FollowUpDialogComponent {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<{ note: string; nextFollowUpAt: string; outcome: string }>();

    note = '';
    outcome = '';
    nextFollowUpAt: Date | null = null;

    close(): void {
        this.visible = false;
        this.visibleChange.emit(this.visible);
        this.note = '';
        this.outcome = '';
        this.nextFollowUpAt = null;
    }

    submit(): void {
        if (!this.note.trim()) {
            return;
        }

        this.save.emit({
            note: this.note.trim(),
            outcome: this.outcome.trim() || 'Follow-up scheduled',
            nextFollowUpAt: this.nextFollowUpAt ? this.nextFollowUpAt.toISOString() : ''
        });
        this.note = '';
        this.outcome = '';
        this.nextFollowUpAt = null;
        this.close();
    }
}
