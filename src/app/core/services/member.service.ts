import { Injectable } from '@angular/core';
import { Member } from '../models/member.model';
import { LocalStorageService } from './local-storage.service';
import { isDemoDataEmptyMode } from './demo-data-reset.service';

const MEMBERS_KEY = 'gym_members';

type DemoMember = Omit<Member, 'id' | 'startDate' | 'duration' | 'active'> & {
  id: string;
  startOffsetMonths: number;
  duration: number;
  active: boolean;
};

@Injectable({ providedIn: 'root' })
export class MemberService {
  constructor(private storage: LocalStorageService) {
    if (!isDemoDataEmptyMode()) {
      this.seed();
    }
  }

  list(): Member[] {
    return this.storage.get<Member[]>(MEMBERS_KEY, []);
  }

  add(member: Omit<Member, 'id'>): Member {
    const created: Member = { ...member, id: crypto.randomUUID() };
    this.storage.set(MEMBERS_KEY, [created, ...this.list().map((item) => this.stripOversizedMedia(item))]);
    return created;
  }

  getById(id: string): Member | undefined {
    return this.list().find((x) => x.id === id);
  }

  update(id: string, member: Omit<Member, 'id'>): Member {
    const items = this.list();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Member not found');
    }

    const updated: Member = { ...items[index], ...member, id };
    items[index] = updated;
    this.storage.set(MEMBERS_KEY, items.map((item) => this.stripOversizedMedia(item)));
    return updated;
  }

  delete(id: string): void {
    this.storage.set(MEMBERS_KEY, this.list().filter((item) => item.id !== id));
  }

  private seed(): void {
    const existing = this.list();
    const hasCurrentDemo = existing.some((member) => member.id.startsWith('demo-member-2026-'));
    if (hasCurrentDemo) {
      return;
    }

    const demoMembers = this.demoMembers().map((member) => ({
      ...member,
      startDate: this.monthsFromToday(member.startOffsetMonths),
      duration: member.duration,
      active: member.active
    }));

    const byEmail = new Set(existing.map((member) => member.email.toLowerCase()));
    const missing = demoMembers.filter((member) => !byEmail.has(member.email.toLowerCase()));

    this.storage.set<Member[]>(MEMBERS_KEY, [...existing, ...missing]);
  }

  private demoMembers(): DemoMember[] {
    return [
      this.member('demo-member-2026-001', 'Arjun', 'Verma', 'Fitness Trainer', 'Male', 'Gold', -2, 12, 'Amit Shah', true, 'arjun.verma@example.com', '9876543210', 'Strength training and morning workouts.'),
      this.member('demo-member-2026-002', 'Neha', 'Sharma', 'Product Designer', 'Female', 'Platinum', -4, 6, 'Maya Nair', true, 'neha.sharma@example.com', '9123456780', 'Yoga and flexibility focus.'),
      this.member('demo-member-2026-003', 'Rohan', 'Mehra', 'Sales Manager', 'Male', 'Annual Elite', -6, 12, 'Sanya Rao', true, 'rohan.mehra@example.com', '9012345678', 'Targets fat loss and conditioning.'),
      this.member('demo-member-2026-004', 'Priya', 'Singh', 'Graphic Designer', 'Female', 'Basic', -1, 1, 'Amit Shah', true, 'priya.singh@example.com', '9345678120', 'Trial member, likely renewal.'),
      this.member('demo-member-2026-005', 'Karan', 'Gupta', 'Accountant', 'Male', 'Gold', -3, 3, 'Sanya Rao', true, 'karan.gupta@example.com', '9456123789', 'Expiring soon, prefers evening slots.'),
      this.member('demo-member-2026-006', 'Ananya', 'Jain', 'Content Writer', 'Female', 'PT Transformation', -1, 3, 'Maya Nair', true, 'ananya.jain@example.com', '9567812340', 'PT package with nutrition support.'),
      this.member('demo-member-2026-007', 'Vivek', 'Patel', 'Entrepreneur', 'Male', 'Annual Elite', -9, 12, 'Ravi Kumar', true, 'vivek.patel@example.com', '9678901234', 'Needs flexible schedule.'),
      this.member('demo-member-2026-008', 'Maya', 'Kapoor', 'Teacher', 'Female', 'Platinum', -5, 6, 'Maya Nair', true, 'maya.kapoor@example.com', '9789012345', 'Weekend sessions.'),
      this.member('demo-member-2026-009', 'Sahil', 'Verma', 'Developer', 'Male', 'Basic', -2, 1, 'Amit Shah', false, 'sahil.verma@example.com', '9890123456', 'Inactive due to travel.'),
      this.member('demo-member-2026-010', 'Tanvi', 'Rao', 'Marketing Lead', 'Female', 'Gold', -4, 3, 'Sanya Rao', false, 'tanvi.rao@example.com', '9967890123', 'Paused membership.'),
      this.member('demo-member-2026-011', 'Rahul', 'Joshi', 'Architect', 'Male', 'Platinum', -8, 6, 'Amit Shah', true, 'rahul.joshi@example.com', '9001234567', 'Expired, needs renewal call.'),
      this.member('demo-member-2026-012', 'Simran', 'Kaur', 'Doctor', 'Female', 'Gold', -5, 3, 'Maya Nair', true, 'simran.kaur@example.com', '9870123456', 'Expired, high-value renewal.'),
      this.member('demo-member-2026-013', 'Aditya', 'Sen', 'Financial Analyst', 'Male', 'Annual Elite', -2, 12, 'Ravi Kumar', true, 'aditya.sen@example.com', '9123987654', 'Cardio and strength mix.'),
      this.member('demo-member-2026-014', 'Pooja', 'Nair', 'Pharmacist', 'Female', 'Student Flex', -1, 1, 'Sanya Rao', true, 'pooja.nair@example.com', '9873216540', 'Offer plan customer.'),
      this.member('demo-member-2026-015', 'Devansh', 'Iyer', 'Product Manager', 'Male', 'PT Transformation', -2, 3, 'Amit Shah', true, 'devansh.iyer@example.com', '9954123780', 'Transformation package.'),
      this.member('demo-member-2026-016', 'Aisha', 'Khan', 'Journalist', 'Female', 'Basic', -1, 1, 'Maya Nair', true, 'aisha.khan@example.com', '9765432109', 'New member onboarding.'),
      this.member('demo-member-2026-017', 'Isha', 'Reddy', 'Interior Designer', 'Female', 'Platinum', -3, 6, 'Sanya Rao', true, 'isha.reddy@example.com', '9487653210', 'Flexibility goals.'),
      this.member('demo-member-2026-018', 'Sameer', 'Sinha', 'Chef', 'Male', 'Gold', -3, 3, 'Amit Shah', true, 'sameer.sinha@example.com', '9367890124', 'Expiring soon.'),
      this.member('demo-member-2026-019', 'Kriti', 'Dubey', 'QA Engineer', 'Female', 'Annual Elite', -10, 12, 'Ravi Kumar', true, 'kriti.dubey@example.com', '9874561230', 'Long-term member.'),
      this.member('demo-member-2026-020', 'Aman', 'Roy', 'Photographer', 'Male', 'Basic', -4, 1, 'Maya Nair', true, 'aman.roy@example.com', '9891234500', 'Expired trial member.'),
      this.member('demo-member-2026-021', 'Meera', 'Chopra', 'Lawyer', 'Female', 'Platinum', -1, 6, 'Maya Nair', true, 'meera.chopra@example.com', '9800011121', 'Premium wellness member.'),
      this.member('demo-member-2026-022', 'Kabir', 'Malhotra', 'Startup Founder', 'Male', 'Annual Elite', -11, 12, 'Ravi Kumar', true, 'kabir.malhotra@example.com', '9800011122', 'Annual renewal due soon.'),
      this.member('demo-member-2026-023', 'Zoya', 'Mirza', 'HR Manager', 'Female', 'Gold', -2, 3, 'Sanya Rao', true, 'zoya.mirza@example.com', '9800011123', 'Group class regular.'),
      this.member('demo-member-2026-024', 'Naveen', 'Balan', 'Banker', 'Male', 'Basic', -1, 1, 'Amit Shah', true, 'naveen.balan@example.com', '9800011124', 'New joiner, needs onboarding.'),
      this.member('demo-member-2026-025', 'Tara', 'Menon', 'Professor', 'Female', 'Student Flex', -2, 1, 'Maya Nair', false, 'tara.menon@example.com', '9800011125', 'Inactive student plan test case.'),
      this.member('demo-member-2026-026', 'Yash', 'Agarwal', 'Consultant', 'Male', 'PT Transformation', -1, 3, 'Amit Shah', true, 'yash.agarwal@example.com', '9800011126', 'High-value PT payment workflow.'),
      this.member('demo-member-2026-027', 'Leena', 'Thomas', 'Nurse', 'Female', 'Gold', -3, 3, 'Sanya Rao', true, 'leena.thomas@example.com', '9800011127', 'Morning slot member.'),
      this.member('demo-member-2026-028', 'Farhan', 'Qureshi', 'Event Planner', 'Male', 'Basic', -1, 1, 'Maya Nair', false, 'farhan.qureshi@example.com', '9800011128', 'Expired member for status filters.'),
      this.member('demo-member-2026-029', 'Bhavya', 'Saxena', 'UX Researcher', 'Female', 'Platinum', -4, 6, 'Amit Shah', true, 'bhavya.saxena@example.com', '9800011129', 'Likes strength and yoga mix.'),
      this.member('demo-member-2026-030', 'Nitin', 'Bora', 'Civil Engineer', 'Male', 'Gold', -2, 3, 'Ravi Kumar', true, 'nitin.bora@example.com', '9800011130', 'Trainer reassignment test member.'),
      this.member('demo-member-2026-031', 'Rhea', 'Dutta', 'Animator', 'Female', 'Annual Elite', -6, 12, 'Sanya Rao', true, 'rhea.dutta@example.com', '9800011131', 'Long plan analytics case.'),
      this.member('demo-member-2026-032', 'Om', 'Prakash', 'Student', 'Male', 'Student Flex', -1, 1, 'Amit Shah', true, 'om.prakash@example.com', '9800011132', 'Student discount workflow.'),
      this.member('demo-member-2026-033', 'Gia', 'Lobo', 'Cabin Crew', 'Female', 'Basic', -2, 1, 'Maya Nair', true, 'gia.lobo@example.com', '9800011133', 'Irregular attendance case.'),
      this.member('demo-member-2026-034', 'Harit', 'Pandey', 'Data Analyst', 'Male', 'Platinum', -5, 6, 'Ravi Kumar', true, 'harit.pandey@example.com', '9800011134', 'Analytics cohort member.'),
      this.member('demo-member-2026-035', 'Suhani', 'Bedi', 'Dentist', 'Female', 'Gold', -3, 3, 'Sanya Rao', true, 'suhani.bedi@example.com', '9800011135', 'Renewal reminder test.'),
      this.member('demo-member-2026-036', 'Tushar', 'Naik', 'Operations Lead', 'Male', 'PT Transformation', -2, 3, 'Amit Shah', true, 'tushar.naik@example.com', '9800011136', 'PT revenue reporting case.'),
      this.member('demo-member-2026-037', 'Mitali', 'Ghosh', 'Copywriter', 'Female', 'Basic', -1, 1, 'Maya Nair', true, 'mitali.ghosh@example.com', '9800011137', 'New member search case.'),
      this.member('demo-member-2026-038', 'Parth', 'Doshi', 'Trader', 'Male', 'Annual Elite', -13, 12, 'Ravi Kumar', false, 'parth.doshi@example.com', '9800011138', 'Expired annual plan case.'),
      this.member('demo-member-2026-039', 'Alia', 'Sheikh', 'Baker', 'Female', 'Platinum', -4, 6, 'Sanya Rao', true, 'alia.sheikh@example.com', '9800011139', 'Card pagination case.'),
      this.member('demo-member-2026-040', 'Gaurav', 'Kulkarni', 'IT Admin', 'Male', 'Gold', -2, 3, 'Amit Shah', true, 'gaurav.kulkarni@example.com', '9800011140', 'Table pagination case.')
    ];
  }

  private member(
    id: string,
    firstName: string,
    lastName: string,
    designation: string,
    gender: string,
    planName: string,
    startOffsetMonths: number,
    duration: number,
    trainer: string,
    active: boolean,
    email: string,
    phone: string,
    notes: string
  ): DemoMember {
    return {
      id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      designation,
      phone,
      email,
      gender,
      dob: '1992-01-15',
      address: `${Math.floor(Math.random() * 90) + 10} Fitness Avenue, Pune`,
      planName,
      startOffsetMonths,
      duration,
      trainer,
      emergencyContact: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      photo: '',
      govId: '',
      notes,
      active
    };
  }

  private monthsFromToday(offset: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toISOString().slice(0, 10);
  }

  private stripOversizedMedia(member: Member): Member {
    const photo = member.photo ?? '';
    const govId = member.govId ?? '';

    return {
      ...member,
      photo: photo.length > 100_000 ? '' : photo,
      govId: govId.length > 100_000 ? '' : govId
    };
  }
}
