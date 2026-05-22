import { Injectable } from '@angular/core';

const DEMO_DATA_VERSION_KEY = 'gym_demo_data_version';
const DEMO_DATA_VERSION = '2026-05-20-fresh-demo-v1';
export const DEMO_DATA_MODE_KEY = 'gym_demo_data_mode';
export type DemoDataMode = 'demo' | 'empty';
const PRESERVED_KEYS = new Set(['gym_auth_user', 'gym_dashboard_widgets', DEMO_DATA_VERSION_KEY, DEMO_DATA_MODE_KEY]);

export function isDemoDataEmptyMode(): boolean {
  return localStorage.getItem(DEMO_DATA_MODE_KEY) === 'empty';
}

@Injectable({ providedIn: 'root' })
export class DemoDataResetService {
  initialize(): void {
    if (!localStorage.getItem(DEMO_DATA_MODE_KEY)) {
      localStorage.setItem(DEMO_DATA_MODE_KEY, 'demo');
    }

    if (localStorage.getItem(DEMO_DATA_VERSION_KEY) === DEMO_DATA_VERSION) {
      return;
    }

    this.clearRecordKeys();
    localStorage.setItem(DEMO_DATA_VERSION_KEY, DEMO_DATA_VERSION);
  }

  resetToEmpty(): void {
    localStorage.setItem(DEMO_DATA_MODE_KEY, 'empty');
    localStorage.setItem(DEMO_DATA_VERSION_KEY, DEMO_DATA_VERSION);
    this.clearRecordKeys();
    window.location.reload();
  }

  loadDummyData(): void {
    localStorage.setItem(DEMO_DATA_MODE_KEY, 'demo');
    localStorage.setItem(DEMO_DATA_VERSION_KEY, DEMO_DATA_VERSION);
    this.clearRecordKeys();
    window.location.reload();
  }

  private clearRecordKeys(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('gym_') && !PRESERVED_KEYS.has(key))
      .forEach((key) => localStorage.removeItem(key));
  }
}
