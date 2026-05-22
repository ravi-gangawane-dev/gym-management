import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface TableColumn {
  field: string;
  header: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [TableModule],
  template: `
    <p-table
      [value]="data()"
      [paginator]="true"
      [rows]="rows()"
      [rowsPerPageOptions]="[5, 10, 20]"
      [sortMode]="'multiple'"
      responsiveLayout="scroll">
      <ng-template pTemplate="header">
        <tr>
          @for (col of columns(); track col.field) {
            <th [pSortableColumn]="col.field">
              {{ col.header }} <p-sortIcon [field]="col.field"></p-sortIcon>
            </th>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          @for (col of columns(); track col.field) {
            <td>{{ row[col.field] }}</td>
          }
        </tr>
      </ng-template>
    </p-table>
  `
})
export class DataTableComponent {
  columns = input<TableColumn[]>([]);
  data = input<object[]>([]);
  rows = input(10);
}
