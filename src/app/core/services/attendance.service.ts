import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Member } from '../models/member.model';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const KEY = 'gym_attendance';

export type CheckInMethod = 'QR Code' | 'Face Recognition' | 'NFC Card' | 'Biometric' | 'Manual';

export interface AttendanceEntry {
  id: string;
  memberId: string;
  memberName: string;
  trainer: string;
  membershipType: string;
  method: CheckInMethod;
  checkedInAt: string;
  checkedOutAt?: string;
  status: 'Inside' | 'Checked Out' | 'Expired Blocked';
}

export interface AttendanceSummary {
  todaysCheckIns: number;
  insideGym: number;
  peakTime: string;
  lateRenewals: number;
  occupancyPercent: number;
  absentMembers: number;
  expiredEntries: number;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private storage: LocalStorageService) {}

  mark(memberId: string, present: boolean): void {
    const entries = this.storage.get<Record<string, boolean>>(KEY, {});
    entries[memberId] = present;
    this.storage.set(KEY, entries);
  }

  list(): AttendanceEntry[] {
    const entries = this.storage.get<AttendanceEntry[] | Record<string, boolean>>(KEY, []);

    if (!Array.isArray(entries)) {
      return [];
    }

    return entries;
  }

  getTodaysEntries(): AttendanceEntry[] {
    const today = this.todayKey();
    return this.list().filter((entry) => entry.checkedInAt.startsWith(today));
  }

  getSummary(totalMembers: number): AttendanceSummary {
    const todaysEntries = this.getTodaysEntries();
    const insideGym = todaysEntries.filter((entry) => entry.status === 'Inside').length;
    const lateRenewals = todaysEntries.filter((entry) => entry.status === 'Expired Blocked').length;
    const checkedInMemberIds = new Set(todaysEntries.map((entry) => entry.memberId));

    return {
      todaysCheckIns: todaysEntries.length,
      insideGym,
      peakTime: this.getPeakTime(todaysEntries),
      lateRenewals,
      occupancyPercent: Math.min(100, Math.round((insideGym / 68) * 100)),
      absentMembers: Math.max(totalMembers - checkedInMemberIds.size, 0),
      expiredEntries: lateRenewals
    };
  }

  markCheckIn(member: Member, method: CheckInMethod = 'QR Code'): { entry: AttendanceEntry; duplicate: boolean } {
    const today = this.todayKey();
    const entries = this.list();
    const existing = entries.find(
      (entry) => entry.memberId === member.id && entry.checkedInAt.startsWith(today) && entry.status !== 'Expired Blocked'
    );

    if (existing) {
      return { entry: existing, duplicate: true };
    }

    const entry: AttendanceEntry = {
      id: crypto.randomUUID(),
      memberId: member.id,
      memberName: member.fullName || `${member.firstName} ${member.lastName}`.trim(),
      trainer: member.trainer || 'Unassigned',
      membershipType: member.planName || 'General',
      method,
      checkedInAt: new Date().toISOString(),
      status: member.active ? 'Inside' : 'Expired Blocked'
    };

    this.storage.set(KEY, [entry, ...entries]);
    return { entry, duplicate: false };
  }

  seedToday(members: Member[]): void {
    if (isDemoDataEmptyMode()) {
      return;
    }

    const today = this.todayKey();
    const entries = this.list();

    if (entries.some((entry) => entry.checkedInAt.startsWith(today)) || !members.length) {
      return;
    }

    const methods: CheckInMethod[] = ['QR Code', 'QR Code', 'Face Recognition', 'NFC Card', 'Biometric', 'Manual'];
    const hours = [5, 6, 6, 7, 7, 8, 8, 9, 12, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 6, 7, 18, 19, 20, 21, 8, 17];
    const sampleMembers = members.slice(0, Math.min(members.length, 28));
    const seeded = sampleMembers.map((member, index) => {
      const checkedInAt = new Date();
      checkedInAt.setHours(hours[index] ?? 18, (index * 7 + 12) % 60, 0, 0);

      return {
        id: crypto.randomUUID(),
        memberId: member.id,
        memberName: member.fullName || `${member.firstName} ${member.lastName}`.trim(),
        trainer: member.trainer || 'Unassigned',
        membershipType: member.planName || 'General',
        method: methods[index % methods.length],
        checkedInAt: checkedInAt.toISOString(),
        checkedOutAt: index % 4 === 0 ? this.addHours(checkedInAt, 1.4).toISOString() : undefined,
        status: !member.active ? 'Expired Blocked' : index % 4 === 0 ? 'Checked Out' : 'Inside'
      } satisfies AttendanceEntry;
    });

    this.storage.set(KEY, [...seeded.reverse(), ...entries]);
  }

  getHourlyFootfall(): Array<{ hour: string; count: number }> {
    const buckets = ['5 AM', '6 AM', '7 AM', '8 AM', '5 PM', '6 PM', '7 PM', '8 PM'];
    const entries = this.getTodaysEntries();

    return buckets.map((hour) => ({
      hour,
      count: entries.filter((entry) => this.toHourLabel(new Date(entry.checkedInAt)) === hour).length
    }));
  }

  getMemberHistory(memberId: string): AttendanceEntry[] {
    return this.list()
      .filter((entry) => entry.memberId === memberId)
      .sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt));
  }

  private getPeakTime(entries: AttendanceEntry[]): string {
    if (!entries.length) {
      return '-';
    }

    const counts = entries.reduce((acc, entry) => {
      const hour = new Date(entry.checkedInAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Number(
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 18
    );
    const endHour = peakHour + 2;

    return `${this.formatHour(peakHour)} - ${this.formatHour(endHour)}`;
  }

  private toHourLabel(date: Date): string {
    return this.formatHour(date.getHours());
  }

  private formatHour(hour: number): string {
    const normalized = hour % 24;
    const display = normalized % 12 || 12;
    return `${display} ${normalized >= 12 ? 'PM' : 'AM'}`;
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
