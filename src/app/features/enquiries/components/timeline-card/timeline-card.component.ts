import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EnquiryTimelineEvent } from '../../../../core/models/enquiry.model';

@Component({
    selector: 'app-timeline-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './timeline-card.component.html',
    styleUrls: ['./timeline-card.component.scss']
})
export class TimelineCardComponent {
    @Input() event!: EnquiryTimelineEvent;
}
