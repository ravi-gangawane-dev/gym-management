import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EnquiryTimelineEvent } from '../../../../core/models/enquiry.model';
import { TimelineCardComponent } from '../timeline-card/timeline-card.component';

@Component({
    selector: 'app-follow-up-timeline',
    standalone: true,
    imports: [CommonModule, TimelineCardComponent],
    templateUrl: './follow-up-timeline.component.html',
    styleUrls: ['./follow-up-timeline.component.scss']
})
export class FollowUpTimelineComponent {
    @Input() timeline: EnquiryTimelineEvent[] = [];

    get sortedTimeline(): EnquiryTimelineEvent[] {
        return [...this.timeline].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
}
