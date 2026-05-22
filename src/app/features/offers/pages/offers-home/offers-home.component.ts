import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isDemoDataEmptyMode } from '../../../../core/services/demo-data-reset.service';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';

type OfferType = 'Discount Coupon' | 'Festival Offer' | 'Referral Reward';
type OfferStatus = 'Active' | 'Scheduled' | 'Paused' | 'Expired';

interface Offer {
  title: string;
  code: string;
  type: OfferType;
  discount: string;
  audience: string;
  redemptions: number;
  limit: number;
  validTill: string;
  status: OfferStatus;
}

@Component({
  selector: 'app-offers-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, TableToolbarComponent],
  template: `
    <div class="offers-page">
      <section class="offers-hero">
        <div>
          <span class="eyebrow">Offers & Coupons</span>
          <h2>Offers</h2>
          <p>Create discount coupons, festival offers, and referral rewards to increase renewals and conversions.</p>
        </div>
        <div class="hero-metrics">
          <article>
            <small>Total Offers</small>
            <strong>{{ offers.length }}</strong>
          </article>
          <article>
            <small>Active Coupons</small>
            <strong>{{ activeCoupons }}</strong>
          </article>
          <article>
            <small>Festival</small>
            <strong>{{ festivalOffers }}</strong>
          </article>
          <article>
            <small>Referral</small>
            <strong>{{ referralRewards }}</strong>
          </article>
          <article>
            <small>Redemptions</small>
            <strong>{{ totalRedemptions }}</strong>
          </article>
        </div>
      </section>

      <section class="offer-types">
        <article class="type-card">
          <i class="pi pi-percentage"></i>
          <h3>Discount Coupons</h3>
          <p>Flat or percentage discounts for renewals, new memberships, PT sessions, and supplements.</p>
        </article>
        <article class="type-card">
          <i class="pi pi-calendar"></i>
          <h3>Festival Offers</h3>
          <p>Diwali, New Year, summer body, and local seasonal campaigns with scheduled validity.</p>
        </article>
        <article class="type-card">
          <i class="pi pi-share-alt"></i>
          <h3>Referral Rewards</h3>
          <p>Reward members for bringing friends with free days, wallet credits, or PT sessions.</p>
        </article>
      </section>

      <section class="offers-layout">
        <div class="page-card">
          <app-table-toolbar title="Offer Campaigns" subtitle="Manage coupon codes, audiences, limits, validity, and redemption performance">
            <div class="filters">
              <app-search-bar
                [value]="searchTerm"
                placeholder="Search offers"
                (valueChange)="searchTerm = $event">
              </app-search-bar>
              <select [(ngModel)]="typeFilter">
                <option>All Types</option>
                <option *ngFor="let type of offerTypes">{{ type }}</option>
              </select>
            </div>
          </app-table-toolbar>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Audience</th>
                  <th>Usage</th>
                  <th>Valid Till</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let offer of filteredOffers">
                  <td><strong>{{ offer.title }}</strong></td>
                  <td><span class="code-pill">{{ offer.code }}</span></td>
                  <td>{{ offer.type }}</td>
                  <td>{{ offer.discount }}</td>
                  <td>{{ offer.audience }}</td>
                  <td>
                    <div class="usage">
                      <span><em [style.width.%]="usagePercent(offer)"></em></span>
                      <small>{{ offer.redemptions }}/{{ offer.limit }}</small>
                    </div>
                  </td>
                  <td>{{ offer.validTill }}</td>
                  <td><span class="status-pill" [ngClass]="statusClass(offer.status)">{{ offer.status }}</span></td>
                </tr>
                <tr *ngIf="!filteredOffers.length">
                  <td colspan="8">No offer records found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside class="side-stack">
          <div class="page-card builder-card">
            <h3>Quick Coupon Builder</h3>
            <label>
              Coupon Code
              <input [(ngModel)]="draftCode" />
            </label>
            <label>
              Discount
              <input [(ngModel)]="draftDiscount" />
            </label>
            <label>
              Audience
              <select [(ngModel)]="draftAudience">
                <option>New Members</option>
                <option>Renewals</option>
                <option>Inactive Members</option>
                <option>Referral Members</option>
              </select>
            </label>
            <button type="button"><i class="pi pi-check"></i> Create Draft</button>
          </div>

          <div class="page-card rewards-card">
            <h3>Referral Rewards</h3>
            <div class="reward-row" *ngFor="let reward of referralRules">
              <i class="pi pi-gift"></i>
              <div>
                <strong>{{ reward.title }}</strong>
                <span>{{ reward.copy }}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  `,
  styles: [
    `
      .offers-page {
        display: grid;
        gap: 1rem;
      }

      .offers-hero {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1.35rem;
        border-radius: 12px;
        color: #fff;
        background: var(--app-hero);
      }

      .hero-metrics {
        display: grid;
        grid-template-columns: repeat(5, minmax(105px, 1fr));
        gap: 0.75rem;
      }

      .hero-metrics article {
        border: 1px solid rgba(255, 255, 255, 0.32);
        border-radius: 10px;
        padding: 0.8rem;
        background: rgba(255, 255, 255, 0.12);
      }

      .hero-metrics small {
        display: block;
        color: rgba(255, 255, 255, 0.86);
        font-weight: 800;
      }

      .hero-metrics strong {
        display: block;
        margin-top: 0.45rem;
        color: #fff;
        font-size: 1.3rem;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      .offers-hero p {
        color: rgba(255, 255, 255, 0.88);
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
      }

      .offers-hero button,
      .builder-card button {
        background: var(--app-secondary-action);
      }

      button i {
        margin-right: 0.35rem;
      }

      .metric-grid,
      .offer-types {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
        gap: 0.85rem;
      }

      .metric-card,
      .type-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .metric-card i,
      .type-card i {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: #eaf4fb;
        color: #0d78b1;
      }

      .metric-card span,
      .section-heading p,
      .type-card p,
      small,
      .reward-row span {
        color: #64748b;
      }

      .metric-card span {
        display: block;
        margin-top: 0.65rem;
        font-size: 0.84rem;
        font-weight: 800;
      }

      .metric-card strong {
        display: block;
        margin: 0.25rem 0;
        font-size: 1.7rem;
        color: #0d78b1;
      }

      .type-card {
        display: grid;
        gap: 0.55rem;
      }

      .offers-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
        gap: 1rem;
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .filters {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .filters app-search-bar {
        flex: 0 1 320px;
        min-width: 240px;
      }

      .filters select {
        flex: 0 0 170px;
      }

      input,
      select {
        width: 100%;
        border: 1px solid #d2dce8;
        border-radius: 8px;
        padding: 0.65rem 0.75rem;
        font: inherit;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 900px;
        border-collapse: collapse;
      }

      th,
      td {
        border-bottom: 1px solid #e2e8f0;
        padding: 0.72rem;
        text-align: left;
        font-size: 0.88rem;
      }

      th {
        background: #f8fafc;
        color: #475569;
        font-size: 0.78rem;
      }

      .code-pill,
      .status-pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.28rem 0.6rem;
        font-size: 0.76rem;
        font-weight: 800;
      }

      .code-pill {
        background: #fff7ed;
        color: #9a3412;
      }

      .status-pill.active {
        background: #dcfce7;
        color: #166534;
      }

      .status-pill.scheduled {
        background: #e0f2fe;
        color: #075985;
      }

      .status-pill.paused {
        background: #fef3c7;
        color: #92400e;
      }

      .status-pill.expired {
        background: #fee2e2;
        color: #991b1b;
      }

      .usage {
        display: grid;
        gap: 0.25rem;
      }

      .usage span {
        height: 8px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .usage em {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--app-primary-action);
      }

      .side-stack,
      .builder-card,
      .rewards-card {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: #475569;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .reward-row {
        display: flex;
        gap: 0.7rem;
        align-items: flex-start;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }

      .reward-row i {
        color: #ef780a;
      }

      .reward-row span {
        display: block;
        margin-top: 0.15rem;
      }

      @media (max-width: 980px) {
        .offers-hero,
        .offers-layout,
        .section-heading {
          display: grid;
          grid-template-columns: 1fr;
        }

        .filters {
          flex-direction: column;
          align-items: stretch;
        }

        .filters app-search-bar,
        .filters select {
          flex-basis: auto;
          min-width: 0;
        }

        .hero-metrics {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class OffersHomeComponent {
  searchTerm = '';
  typeFilter: OfferType | 'All Types' = 'All Types';
  draftCode = 'FIT20';
  draftDiscount = '20% off';
  draftAudience = 'Renewals';

  offerTypes: OfferType[] = ['Discount Coupon', 'Festival Offer', 'Referral Reward'];

  offers: Offer[] = isDemoDataEmptyMode() ? [] : [
    { title: 'Renewal Saver', code: 'RENEW15', type: 'Discount Coupon', discount: '15% off', audience: 'Expiring members', redemptions: 36, limit: 100, validTill: '31 May 2026', status: 'Active' },
    { title: 'Summer Fitness Fest', code: 'SUMMER25', type: 'Festival Offer', discount: '25% off annual plan', audience: 'New leads', redemptions: 21, limit: 80, validTill: '15 Jun 2026', status: 'Active' },
    { title: 'Bring A Friend', code: 'REFER500', type: 'Referral Reward', discount: 'Rs. 500 wallet credit', audience: 'Active members', redemptions: 18, limit: 60, validTill: '30 Jun 2026', status: 'Scheduled' },
    { title: 'PT Starter Pack', code: 'PT10', type: 'Discount Coupon', discount: '10% off PT sessions', audience: 'New members', redemptions: 44, limit: 50, validTill: '25 May 2026', status: 'Paused' },
    { title: 'New Year Transformation', code: 'NYFIT30', type: 'Festival Offer', discount: '30% off premium plan', audience: 'All leads', redemptions: 120, limit: 120, validTill: '31 Jan 2026', status: 'Expired' }
  ];

  referralRules = isDemoDataEmptyMode() ? [] : [
    { title: 'Member Reward', copy: 'Existing member gets Rs. 500 credit after friend joins.' },
    { title: 'Friend Benefit', copy: 'Referred friend receives 7 free trial days.' },
    { title: 'Trainer Bonus', copy: 'Assigned trainer gets a reward when referral converts.' }
  ];

  get filteredOffers(): Offer[] {
    const term = this.searchTerm.trim().toLowerCase();
    const type = this.typeFilter !== 'All Types' ? this.typeFilter : '';

    return this.offers.filter((offer) => {
      const matchesType = !type || offer.type === type;
      const matchesSearch =
        !term ||
        [offer.title, offer.code, offer.type, offer.discount, offer.audience, offer.status]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesType && matchesSearch;
    });
  }

  get activeCoupons(): number {
    return this.offers.filter((offer) => offer.type === 'Discount Coupon' && offer.status === 'Active').length;
  }

  get festivalOffers(): number {
    return this.offers.filter((offer) => offer.type === 'Festival Offer').length;
  }

  get referralRewards(): number {
    return this.offers.filter((offer) => offer.type === 'Referral Reward').length;
  }

  get totalRedemptions(): number {
    return this.offers.reduce((sum, offer) => sum + offer.redemptions, 0);
  }

  usagePercent(offer: Offer): number {
    return Math.min(100, Math.round((offer.redemptions / offer.limit) * 100));
  }

  statusClass(status: OfferStatus): string {
    return status.toLowerCase();
  }
}
