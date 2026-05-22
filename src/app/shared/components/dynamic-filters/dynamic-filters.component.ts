import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

export type FilterFieldType = 'text' | 'date' | 'status' | 'trainer' | 'paymentType' | 'gender' | 'amount' | 'select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: Array<string | FilterOption>;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export type FilterValue = string | Date | number | null | { min?: number | null; max?: number | null };
export type FilterState = Record<string, FilterValue>;

@Component({
  selector: 'app-dynamic-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, SelectModule, DatePickerModule, InputNumberModule],
  template: `
    <section class="dynamic-filters">
      <header>
        <div>
          <h3>{{ title() }}</h3>
          <span *ngIf="subtitle()">{{ subtitle() }}</span>
        </div>
        <div class="filter-actions">
          <span class="active-count" *ngIf="activeCount">{{ activeCount }} active</span>
          <button type="button" class="secondary" (click)="resetAll()">
            <i class="pi pi-refresh"></i>
            Reset
          </button>
          <button type="button" (click)="apply.emit(draft)">
            <i class="pi pi-filter"></i>
            Set Filter
          </button>
        </div>
      </header>

      <div class="filter-grid">
        <label class="filter-field" *ngFor="let field of configs(); trackBy: trackField">
          <span>{{ field.label }}</span>

          <div class="filter-control" [ngSwitch]="field.type">
            <ng-container *ngSwitchCase="'date'">
              <p-datepicker
                [(ngModel)]="draft[field.key]"
                dateFormat="dd-mm-yy"
                [showIcon]="true"
                [showButtonBar]="true"
                [placeholder]="field.placeholder || 'Select date'">
              </p-datepicker>
            </ng-container>

            <ng-container *ngSwitchCase="'amount'">
              <div class="range-row">
                <p-inputNumber
                  [ngModel]="rangeValue(field.key).min"
                  (ngModelChange)="setRangeValue(field.key, 'min', $event)"
                  mode="decimal"
                  [min]="0"
                  [placeholder]="field.minPlaceholder || 'Min'">
                </p-inputNumber>
                <p-inputNumber
                  [ngModel]="rangeValue(field.key).max"
                  (ngModelChange)="setRangeValue(field.key, 'max', $event)"
                  mode="decimal"
                  [min]="0"
                  [placeholder]="field.maxPlaceholder || 'Max'">
                </p-inputNumber>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'text'">
              <span class="text-filter">
                <i class="pi pi-search"></i>
                <input pInputText [(ngModel)]="draft[field.key]" [placeholder]="field.placeholder || 'Search'" />
              </span>
            </ng-container>

            <ng-container *ngSwitchDefault>
              <p-select
                [(ngModel)]="draft[field.key]"
                [options]="normalizedOptions(field)"
                optionLabel="label"
                optionValue="value"
                appendTo="body"
                [showClear]="true"
                [placeholder]="field.placeholder || 'Select'">
              </p-select>
            </ng-container>

            <button
              *ngIf="hasValue(field.key)"
              type="button"
              class="clear-filter"
              (click)="clearField(field.key)"
              aria-label="Clear filter"
              title="Clear filter">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </label>
      </div>
    </section>
  `,
  styles: [
    `
      .dynamic-filters {
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface);
        box-shadow: var(--app-shadow-soft);
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.9rem 1rem;
        border-bottom: 1px solid var(--app-border);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      header span {
        display: block;
        margin-top: 0.15rem;
        color: var(--app-muted);
        font-size: 0.78rem;
        font-weight: 700;
      }

      .filter-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .active-count {
        margin: 0;
        min-width: 4.5rem;
        padding: 0.28rem 0.55rem;
        border-radius: 999px;
        background: #eaf4fb;
        color: var(--rdg-accent);
        text-align: center;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        min-height: 2.15rem;
        border: 1px solid var(--rdg-primary);
        border-radius: 8px;
        padding: 0 0.7rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      button.secondary {
        border-color: var(--app-border);
        background: var(--app-surface-soft);
        color: var(--rdg-accent);
      }

      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 0.75rem;
        padding: 1rem;
      }

      .filter-field {
        display: grid;
        gap: 0.38rem;
        min-width: 0;
      }

      .filter-field > span {
        color: #334155;
        font-size: 0.8rem;
        font-weight: 800;
      }

      .filter-control {
        position: relative;
      }

      :host ::ng-deep .p-select,
      :host ::ng-deep .p-datepicker,
      :host ::ng-deep .p-inputnumber,
      :host ::ng-deep .p-inputnumber-input,
      input {
        width: 100%;
      }

      .text-filter {
        position: relative;
        display: block;
      }

      .text-filter i {
        position: absolute;
        top: 50%;
        left: 0.7rem;
        color: #64748b;
        transform: translateY(-50%);
      }

      .text-filter input {
        padding-left: 2.1rem;
      }

      .range-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .clear-filter {
        position: absolute;
        top: -0.55rem;
        right: -0.45rem;
        width: 1.45rem;
        min-height: 1.45rem;
        height: 1.45rem;
        border-radius: 999px;
        padding: 0;
        background: #ffffff;
        color: #64748b;
        border-color: var(--app-border);
        box-shadow: var(--app-shadow-soft);
      }

      @media (max-width: 640px) {
        header {
          align-items: stretch;
          flex-direction: column;
        }

        .filter-actions button {
          flex: 1;
        }
      }
    `
  ]
})
export class DynamicFiltersComponent implements OnChanges {
  title = input('Filters');
  subtitle = input('');
  configs = input<FilterConfig[]>([]);
  value = input<FilterState>({});
  apply = output<FilterState>();
  reset = output<void>();
  valueChange = output<FilterState>();

  draft: FilterState = {};

  get activeCount(): number {
    return Object.values(this.draft).filter((value) => this.isFilled(value)).length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.draft = this.cloneState(this.value());
    }
  }

  normalizedOptions(field: FilterConfig): FilterOption[] {
    return (field.options ?? []).map((option) =>
      typeof option === 'string' ? { label: option, value: option } : option
    );
  }

  rangeValue(key: string): { min?: number | null; max?: number | null } {
    if (!this.draft[key] || typeof this.draft[key] !== 'object' || this.draft[key] instanceof Date) {
      this.draft[key] = { min: null, max: null };
    }

    return this.draft[key] as { min?: number | null; max?: number | null };
  }

  setRangeValue(key: string, edge: 'min' | 'max', value: number | null): void {
    const range = this.rangeValue(key);
    this.draft = { ...this.draft, [key]: { ...range, [edge]: value } };
    this.valueChange.emit(this.cloneState(this.draft));
  }

  hasValue(key: string): boolean {
    return this.isFilled(this.draft[key]);
  }

  clearField(key: string): void {
    this.draft = { ...this.draft, [key]: null };
    this.valueChange.emit(this.cloneState(this.draft));
  }

  resetAll(): void {
    this.draft = {};
    this.valueChange.emit({});
    this.reset.emit();
  }

  trackField(_: number, field: FilterConfig): string {
    return field.key;
  }

  private cloneState(state: FilterState): FilterState {
    return Object.entries(state ?? {}).reduce<FilterState>((acc, [key, value]) => {
      acc[key] = value instanceof Date ? new Date(value) : typeof value === 'object' && value !== null ? { ...value } : value;
      return acc;
    }, {});
  }

  private isFilled(value: FilterValue | undefined): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
      return value.min !== null && value.min !== undefined || value.max !== null && value.max !== undefined;
    }

    return true;
  }
}
