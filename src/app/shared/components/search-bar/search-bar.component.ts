import { CommonModule } from '@angular/common';
import { Component, OnDestroy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  template: `
    <span class="app-search-bar">
      <i class="pi pi-search"></i>
      <input
        pInputText
        type="search"
        [ngModel]="value()"
        [placeholder]="placeholder()"
        (ngModelChange)="onInput($event)" />
      <button *ngIf="value()" type="button" (click)="clear()" aria-label="Clear search" title="Clear search">
        <i class="pi pi-times"></i>
      </button>
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        width: min(100%, 360px);
      }

      .app-search-bar {
        position: relative;
        display: block;
        width: 100%;
      }

      i {
        position: absolute;
        top: 50%;
        left: 0.75rem;
        z-index: 1;
        color: #64748b;
        transform: translateY(-50%);
      }

      input {
        width: 100%;
        height: 2.45rem;
        padding-left: 2.25rem;
        padding-right: 2.35rem;
        border-radius: 8px;
      }

      button {
        position: absolute;
        top: 50%;
        right: 0.35rem;
        display: grid;
        place-items: center;
        width: 1.8rem;
        height: 1.8rem;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        transform: translateY(-50%);
      }

      button:hover {
        background: #eef2f7;
        color: #0f172a;
      }

      @media (max-width: 640px) {
        :host {
          width: 100%;
        }
      }
    `
  ]
})
export class SearchBarComponent implements OnDestroy {
  value = input('');
  placeholder = input('Search...');
  debounceMs = input(300);
  valueChange = output<string>();

  private changes = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.changes
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => this.valueChange.emit(value));
  }

  onInput(value: string): void {
    this.changes.next(value);
  }

  clear(): void {
    this.valueChange.emit('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
