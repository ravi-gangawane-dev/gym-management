import { Injectable } from '@angular/core';
import { Plan } from '../models/plan.model';
import { LocalStorageService } from './local-storage.service';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const KEY = 'gym_plans';

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'demo-plan-basic',
    name: 'Basic',
    price: 999,
    durationMonths: 1,
    sessionsPerWeek: 3,
    status: 'Active',
    description: 'Starter access for beginners and casual gym users.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-gold',
    name: 'Gold',
    price: 2699,
    durationMonths: 3,
    sessionsPerWeek: 4,
    status: 'Active',
    description: 'Popular quarterly plan with strength and cardio access.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-platinum',
    name: 'Platinum',
    price: 4999,
    durationMonths: 6,
    sessionsPerWeek: 5,
    status: 'Active',
    description: 'Premium plan with group classes, tracking, and trainer support.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-annual',
    name: 'Annual Elite',
    price: 8999,
    durationMonths: 12,
    sessionsPerWeek: 6,
    status: 'Active',
    description: 'Best value yearly membership for consistent training.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-pt',
    name: 'PT Transformation',
    price: 12999,
    durationMonths: 3,
    sessionsPerWeek: 5,
    status: 'Active',
    description: 'Personal training package with nutrition and progress reviews.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-student',
    name: 'Student Flex',
    price: 1499,
    durationMonths: 1,
    sessionsPerWeek: 4,
    status: 'Inactive',
    description: 'Paused student offer kept for historical package data.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-couple',
    name: 'Couple Fit',
    price: 4499,
    durationMonths: 3,
    sessionsPerWeek: 4,
    status: 'Active',
    description: 'Shared quarterly plan for two members with group classes.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-weekend',
    name: 'Weekend Warrior',
    price: 1899,
    durationMonths: 1,
    sessionsPerWeek: 2,
    status: 'Active',
    description: 'Weekend-only access for busy professionals.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-yoga',
    name: 'Yoga Unlimited',
    price: 3499,
    durationMonths: 3,
    sessionsPerWeek: 6,
    status: 'Active',
    description: 'Yoga, mobility, recovery, and flexibility focused membership.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-corporate',
    name: 'Corporate Wellness',
    price: 6999,
    durationMonths: 6,
    sessionsPerWeek: 5,
    status: 'Active',
    description: 'Corporate bundle plan for employee wellness programs.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-plan-senior',
    name: 'Senior Mobility',
    price: 1299,
    durationMonths: 1,
    sessionsPerWeek: 3,
    status: 'Inactive',
    description: 'Low-impact mobility plan currently paused for review.',
    createdAt: new Date().toISOString()
  }
];

@Injectable({ providedIn: 'root' })
export class PlanService {
  constructor(private storage: LocalStorageService) {
    if (!isDemoDataEmptyMode()) {
      this.seed();
    }
  }

  list(): Plan[] {
    return this.normalize(this.storage.get<Plan[] | string[]>(KEY, isDemoDataEmptyMode() ? [] : DEFAULT_PLANS));
  }

  getById(id: string): Plan | undefined {
    return this.list().find((item) => item.id === id);
  }

  add(plan: Omit<Plan, 'id' | 'createdAt'>): Plan {
    const created: Plan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    this.storage.set(KEY, [created, ...this.list()]);
    return created;
  }

  update(id: string, plan: Omit<Plan, 'id' | 'createdAt'>): Plan {
    const items = this.list();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Plan not found');
    }

    const updated: Plan = {
      ...items[index],
      ...plan,
      id,
      createdAt: items[index].createdAt
    };

    items[index] = updated;
    this.storage.set(KEY, items);
    return updated;
  }

  delete(id: string): void {
    this.storage.set(KEY, this.list().filter((item) => item.id !== id));
  }

  private normalize(value: Plan[] | string[] | unknown): Plan[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => {
      if (typeof item === 'string') {
        return this.fromLegacyString(item);
      }

      if (!item || typeof item !== 'object') {
        return this.fromLegacyString(String(item));
      }

      return {
        id: item.id || crypto.randomUUID(),
        name: item.name || 'Untitled Plan',
        price: Number(item.price) || 0,
        durationMonths: Number(item.durationMonths) || 1,
        sessionsPerWeek: Number(item.sessionsPerWeek) || 1,
        status: item.status === 'Inactive' ? 'Inactive' : 'Active',
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString()
      } as Plan;
    });
  }

  private fromLegacyString(value: string): Plan {
    const [rawName, rawPrice] = value.split(' - ').map((item) => item.trim());

    return {
      id: crypto.randomUUID(),
      name: rawName || 'Plan',
      price: Number(rawPrice) || 0,
      durationMonths: 1,
      sessionsPerWeek: 1,
      status: 'Active',
      description: '',
      createdAt: new Date().toISOString()
    };
  }

  private seed(): void {
    const existing = this.normalize(this.storage.get<Plan[] | string[]>(KEY, []));
    const byName = new Set(existing.map((plan) => plan.name.toLowerCase()));
    const missing = DEFAULT_PLANS.filter((plan) => !byName.has(plan.name.toLowerCase()));

    if (!existing.length || missing.length) {
      this.storage.set(KEY, [...existing, ...missing]);
    }
  }
}
