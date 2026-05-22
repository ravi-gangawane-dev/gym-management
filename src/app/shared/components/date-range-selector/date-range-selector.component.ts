import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
  preset?: string | null;
}

@Component({
  selector: 'app-date-range-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, SelectModule],
  template: `
    <div class="date-range-selector">
      <p-select
        [options]="presets"
        optionLabel="label"
        optionValue="value"
        [ngModel]="value().preset"
        placeholder="Preset"
        appendTo="body"
        (ngModelChange)="selectPreset($event)">
      </p-select>
      <p-datepicker
        [ngModel]="rangeModel"
        selectionMode="range"
        [numberOfMonths]="2"
        dateFormat="dd-mm-yy"
        [showIcon]="true"
        [showButtonBar]="true"
        placeholder="Start date - End date"
        appendTo="body"
        (ngModelChange)="setRange($event)">
      </p-datepicker>
    </div>
  `,
  styles: [
    `
      .date-range-selector {
        display: grid;
        grid-template-columns: 120px 250px;
        gap: 0.55rem;
        width: max-content;
        max-width: 100%;
      }

      :host ::ng-deep .p-select,
      :host ::ng-deep .p-datepicker {
        width: 100%;
      }

      :host ::ng-deep .p-datepicker .p-inputtext {
        border-right: 0;
      }

      :host ::ng-deep .p-datepicker .p-datepicker-dropdown,
      :host ::ng-deep .p-datepicker .p-datepicker-trigger,
      :host ::ng-deep .p-datepicker .p-inputgroup-addon,
      :host ::ng-deep .p-datepicker .p-button {
        width: 2.65rem;
        min-width: 2.65rem;
        height: 2.65rem;
        border-color: #cbd5e1;
        border-left: 0;
        background: #ffffff !important;
        color: #475569 !important;
        box-shadow: none;
      }

      :host ::ng-deep .p-datepicker .p-datepicker-dropdown:hover,
      :host ::ng-deep .p-datepicker .p-datepicker-trigger:hover,
      :host ::ng-deep .p-datepicker .p-button:hover {
        background: #ffffff !important;
        color: #0f172a !important;
      }

      @media (max-width: 720px) {
        .date-range-selector {
          grid-template-columns: 1fr;
          width: 100%;
        }
      }
    `
  ]
})
export class DateRangeSelectorComponent implements OnChanges {
  value = input<DateRangeValue>({ start: null, end: null, preset: null });
  valueChange = output<DateRangeValue>();
  rangeModel: Date[] | null = null;

  presets = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.syncRangeModel();
    }
  }

  selectPreset(preset: string): void {
    const end = this.startOfDay(new Date());
    const start = new Date(end);

    if (preset === '7d') {
      start.setDate(end.getDate() - 6);
    } else if (preset === '1m') {
      start.setMonth(end.getMonth() - 1);
    } else if (preset === '3m') {
      start.setMonth(end.getMonth() - 3);
    } else if (preset === '6m') {
      start.setMonth(end.getMonth() - 6);
    } else if (preset === '1y') {
      start.setFullYear(end.getFullYear() - 1);
    }

    this.rangeModel = [start, end];
    this.valueChange.emit({ start, end, preset });
  }

  setRange(range: Date[] | null): void {
    this.rangeModel = range?.length ? [...range] : null;
    this.valueChange.emit({
      start: range?.[0] ?? null,
      end: range?.[1] ?? null,
      preset: null
    });
  }

  private syncRangeModel(): void {
    const start = this.value().start;
    const end = this.value().end;

    if (!start && !end) {
      this.rangeModel = null;
      return;
    }

    this.rangeModel = [start, end].filter((date): date is Date => !!date);
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
}
