import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isDemoDataEmptyMode } from '../../../../core/services/demo-data-reset.service';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { TableToolbarComponent } from '../../../../shared/components/table-toolbar/table-toolbar.component';

type InventoryCategory = 'Supplements' | 'Protein Stock' | 'Gym Equipment' | 'Merchandise';
type InventoryStatus = 'In Stock' | 'Low Stock' | 'Maintenance' | 'Out of Stock';

interface InventoryItem {
  name: string;
  category: InventoryCategory;
  sku: string;
  stock: number;
  minimum: number;
  unit: string;
  value: number;
  supplier: string;
  status: InventoryStatus;
  nextAction: string;
}

@Component({
  selector: 'app-inventory-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, TableToolbarComponent],
  template: `
    <div class="inventory-page">
      <section class="inventory-hero">
        <div>
          <span class="eyebrow">Inventory Management</span>
          <h2>Inventory</h2>
          <p>Track supplements, protein stock, gym equipment, and merchandise with low-stock and maintenance alerts.</p>
        </div>
        <div class="hero-metrics">
          <article>
            <small>Total Items</small>
            <strong>{{ items.length }}</strong>
          </article>
          <article>
            <small>Low Stock</small>
            <strong>{{ lowStockCount }}</strong>
          </article>
          <article>
            <small>Service</small>
            <strong>{{ maintenanceCount }}</strong>
          </article>
          <article>
            <small>Out of Stock</small>
            <strong>{{ outOfStockCount }}</strong>
          </article>
          <article>
            <small>Stock Value</small>
            <strong>Rs. {{ totalValue }}</strong>
          </article>
        </div>
      </section>

      <section class="category-grid">
        <article *ngFor="let category of categorySummary" class="category-card">
          <i [class]="category.icon"></i>
          <div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.copy }}</p>
            <strong>{{ category.count }} items</strong>
          </div>
        </article>
      </section>

      <section class="inventory-layout">
        <div class="page-card inventory-table">
          <app-table-toolbar title="Stock Register" subtitle="Monitor quantity, minimum level, value, supplier, and next action">
            <div class="filters">
              <app-search-bar
                [value]="searchTerm"
                placeholder="Search inventory"
                (valueChange)="searchTerm = $event">
              </app-search-bar>
              <select [(ngModel)]="categoryFilter">
                <option>All Categories</option>
                <option *ngFor="let category of categories">{{ category }}</option>
              </select>
            </div>
          </app-table-toolbar>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Minimum</th>
                  <th>Value</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredItems">
                  <td>
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.sku }}</small>
                  </td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.stock }} {{ item.unit }}</td>
                  <td>{{ item.minimum }} {{ item.unit }}</td>
                  <td>Rs. {{ item.value }}</td>
                  <td>{{ item.supplier }}</td>
                  <td><span class="status-pill" [ngClass]="statusClass(item.status)">{{ item.status }}</span></td>
                  <td>{{ item.nextAction }}</td>
                </tr>
                <tr *ngIf="!filteredItems.length">
                  <td colspan="8">No inventory records found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside class="side-stack">
          <div class="page-card alert-panel">
            <h3>Low Inventory Alerts</h3>
            <div class="alert-row" *ngFor="let item of alertItems">
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.stock }} {{ item.unit }} left</span>
              </div>
              <button type="button">Reorder</button>
            </div>
            <p class="empty-copy" *ngIf="!alertItems.length">No low inventory alerts</p>
          </div>

          <div class="page-card maintenance-panel">
            <h3>Equipment Maintenance</h3>
            <div class="maintenance-row" *ngFor="let item of maintenanceItems">
              <i class="pi pi-wrench"></i>
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.nextAction }}</span>
              </div>
            </div>
            <p class="empty-copy" *ngIf="!maintenanceItems.length">No maintenance records</p>
          </div>
        </aside>
      </section>
    </div>
  `,
  styles: [
    `
      .inventory-page {
        display: grid;
        gap: 1rem;
      }

      .inventory-hero {
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

      .inventory-hero p {
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

      .inventory-hero button {
        background: var(--app-secondary-action);
      }

      button i {
        margin-right: 0.35rem;
      }

      .metric-grid,
      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
        gap: 0.85rem;
      }

      .metric-card,
      .category-card {
        background: #fff;
        border: 1px solid #dde5ee;
        border-radius: 8px;
        padding: 1rem;
      }

      .metric-card i,
      .category-card i {
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
      .category-card p,
      small,
      .alert-row span,
      .maintenance-row span {
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

      .category-card {
        display: flex;
        gap: 0.75rem;
      }

      .category-card strong {
        display: block;
        margin-top: 0.55rem;
        color: #ef780a;
      }

      .inventory-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
        gap: 1rem;
      }

      .section-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: flex-start;
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
        flex: 0 0 190px;
      }

      input,
      select {
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
        min-width: 880px;
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

      td small {
        display: block;
      }

      .status-pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.28rem 0.6rem;
        font-size: 0.76rem;
        font-weight: 800;
      }

      .in-stock {
        background: #dcfce7;
        color: #166534;
      }

      .low-stock {
        background: #ffedd5;
        color: #9a3412;
      }

      .maintenance {
        background: #e0f2fe;
        color: #075985;
      }

      .out-of-stock {
        background: #fee2e2;
        color: #991b1b;
      }

      .side-stack,
      .alert-panel,
      .maintenance-panel {
        display: grid;
        gap: 0.75rem;
        align-content: start;
      }

      .alert-row,
      .maintenance-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
      }

      .alert-row span,
      .maintenance-row span {
        display: block;
        margin-top: 0.15rem;
      }

      .alert-row button {
        padding: 0.42rem 0.6rem;
        background: var(--app-secondary-action);
      }

      .maintenance-row {
        justify-content: flex-start;
      }

      .maintenance-row i {
        color: #0d78b1;
      }

      .empty-copy {
        margin: 0;
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #64748b;
        background: #f8fafc;
        font-weight: 700;
      }

      @media (max-width: 980px) {
        .inventory-hero,
        .inventory-layout,
        .section-heading {
          grid-template-columns: 1fr;
          display: grid;
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
export class InventoryHomeComponent {
  searchTerm = '';
  categoryFilter: InventoryCategory | 'All Categories' = 'All Categories';

  categories: InventoryCategory[] = ['Supplements', 'Protein Stock', 'Gym Equipment', 'Merchandise'];

  items: InventoryItem[] = isDemoDataEmptyMode() ? [] : [
    { name: 'Whey Protein Chocolate', category: 'Protein Stock', sku: 'PRO-WHEY-CHOC', stock: 12, minimum: 10, unit: 'tubs', value: 42000, supplier: 'FitFuel India', status: 'In Stock', nextAction: 'Monitor weekly' },
    { name: 'Whey Protein Vanilla', category: 'Protein Stock', sku: 'PRO-WHEY-VAN', stock: 4, minimum: 10, unit: 'tubs', value: 14000, supplier: 'FitFuel India', status: 'Low Stock', nextAction: 'Reorder 20 tubs' },
    { name: 'BCAA Orange', category: 'Supplements', sku: 'SUP-BCAA-ORG', stock: 8, minimum: 12, unit: 'jars', value: 9600, supplier: 'NutriMax', status: 'Low Stock', nextAction: 'Reorder this week' },
    { name: 'Creatine Monohydrate', category: 'Supplements', sku: 'SUP-CREA-300', stock: 0, minimum: 8, unit: 'jars', value: 0, supplier: 'NutriMax', status: 'Out of Stock', nextAction: 'Urgent purchase' },
    { name: 'Treadmill T-04', category: 'Gym Equipment', sku: 'EQP-TREAD-04', stock: 1, minimum: 1, unit: 'unit', value: 85000, supplier: 'PowerFit', status: 'Maintenance', nextAction: 'Service belt on Monday' },
    { name: 'Dumbbell Set 2.5-30kg', category: 'Gym Equipment', sku: 'EQP-DB-SET', stock: 2, minimum: 1, unit: 'sets', value: 64000, supplier: 'IronWorks', status: 'In Stock', nextAction: 'Inspect monthly' },
    { name: 'RDG Gym T-Shirt', category: 'Merchandise', sku: 'MER-TSHIRT', stock: 35, minimum: 15, unit: 'pcs', value: 17500, supplier: 'Local Vendor', status: 'In Stock', nextAction: 'Promote at reception' },
    { name: 'Shaker Bottle', category: 'Merchandise', sku: 'MER-SHAKER', stock: 9, minimum: 20, unit: 'pcs', value: 2700, supplier: 'FitFuel India', status: 'Low Stock', nextAction: 'Bundle with protein' }
  ];

  get categorySummary() {
    return [
    { name: 'Supplements', icon: 'pi pi-heart', copy: 'BCAA, creatine, pre-workout, vitamins, and wellness products.', count: this.countByCategory('Supplements') },
    { name: 'Protein Stock', icon: 'pi pi-box', copy: 'Whey, mass gainers, vegan protein, and flavor-wise tub tracking.', count: this.countByCategory('Protein Stock') },
    { name: 'Gym Equipment', icon: 'pi pi-wrench', copy: 'Machines, weights, benches, cables, and service schedules.', count: this.countByCategory('Gym Equipment') },
    { name: 'Merchandise', icon: 'pi pi-shopping-bag', copy: 'T-shirts, bottles, gloves, towels, and retail add-ons.', count: this.countByCategory('Merchandise') }
    ];
  }

  get filteredItems(): InventoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    const category = this.categoryFilter !== 'All Categories' ? this.categoryFilter : '';

    return this.items.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesSearch =
        !term ||
        [item.name, item.category, item.sku, item.supplier, item.status, item.nextAction]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  }

  get lowStockCount(): number {
    return this.items.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  }

  get maintenanceCount(): number {
    return this.items.filter((item) => item.status === 'Maintenance').length;
  }

  get outOfStockCount(): number {
    return this.items.filter((item) => item.status === 'Out of Stock').length;
  }

  get totalValue(): string {
    return this.items.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN');
  }

  get alertItems(): InventoryItem[] {
    return this.items.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock');
  }

  get maintenanceItems(): InventoryItem[] {
    return this.items.filter((item) => item.category === 'Gym Equipment' && item.status === 'Maintenance');
  }

  statusClass(status: InventoryStatus): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }

  private countByCategory(category: InventoryCategory): number {
    return this.items.filter((item) => item.category === category).length;
  }
}
