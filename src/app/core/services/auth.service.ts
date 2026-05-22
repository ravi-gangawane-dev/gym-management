import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

export type UserRole = 'Admin' | 'Manager' | 'Receptionist' | 'Trainer';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  loginAt: string;
  rememberMe: boolean;
}

interface LoginAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

const AUTH_KEY = 'gym_auth_user';
const WIDGET_KEY = 'gym_dashboard_widgets';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accounts: LoginAccount[] = [
    {
      email: 'admin',
      password: 'admin123',
      name: 'Admin',
      role: 'Admin',
      permissions: ['All']
    },
    {
      email: 'manager',
      password: 'manager123',
      name: 'Manager',
      role: 'Manager',
      permissions: ['Members', 'Enquiries', 'Plans', 'Payments', 'Attendance', 'Staff', 'Inventory', 'Offers', 'Reports', 'AI Insights', 'Notifications', 'Settings']
    },
    {
      email: 'reception',
      password: 'reception123',
      name: 'Reception',
      role: 'Receptionist',
      permissions: ['Members', 'Enquiries', 'Plans', 'Payments', 'Attendance', 'Notifications']
    },
    {
      email: 'trainer',
      password: 'trainer123',
      name: 'Trainer',
      role: 'Trainer',
      permissions: ['Members', 'Attendance', 'Workout Plans', 'Diet Plans', 'Task Management']
    }
  ];

  private routePermissions: Record<string, string> = {
    'ai-insights': 'AI Insights',
    attendance: 'Attendance',
    crm: 'CRM',
    'diet-plans': 'Diet Plans',
    enquiries: 'Enquiries',
    inventory: 'Inventory',
    members: 'Members',
    'membership-cards': 'Membership Cards',
    notifications: 'Notifications',
    offers: 'Offers',
    payments: 'Payments',
    plans: 'Plans',
    profile: 'Profile',
    reports: 'Reports',
    settings: 'Settings',
    staff: 'Staff',
    'task-management': 'Task Management',
    trainers: 'Staff',
    'workout-plans': 'Workout Plans'
  };

  constructor(private storage: LocalStorageService) { }

  login(email: string, password: string, role?: UserRole, rememberMe = false): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password && (!role || item.role === role)
    );

    if (!account) {
      return false;
    }

    this.storage.set(AUTH_KEY, {
      email: account.email,
      name: account.name,
      role: account.role,
      permissions: account.permissions,
      loginAt: new Date().toISOString(),
      rememberMe
    } satisfies AuthUser);
    return true;
  }

  logout(): void {
    this.storage.remove(AUTH_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  currentUser(): AuthUser | null {
    return this.storage.get<AuthUser | null>(AUTH_KEY, null);
  }

  canAccessPermission(permission: string): boolean {
    const user = this.currentUser();
    return !!user?.permissions && (user.permissions.includes('All') || user.permissions.includes(permission));
  }

  canAccessRoute(path: string): boolean {
    const section = path.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] || 'dashboard';
    if (section === 'dashboard') {
      return true;
    }

    const permission = this.routePermissions[section];
    return permission ? this.canAccessPermission(permission) : true;
  }

  requestPasswordReminder(email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    return this.accounts.some((account) => account.email.toLowerCase() === normalizedEmail);
  }

  dashboardWidgetIds(): string[] {
    const user = this.currentUser();
    if (!user) {
      return [];
    }

    const stored = this.storage.get<Record<string, string[]> | null>(WIDGET_KEY, null);
    return stored?.[user.email] ?? [];
  }

  saveDashboardWidgetIds(widgetIds: string[]): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    const stored = this.storage.get<Record<string, string[]> | null>(WIDGET_KEY, null) ?? {};
    stored[user.email] = widgetIds;
    this.storage.set(WIDGET_KEY, stored);
  }
}
