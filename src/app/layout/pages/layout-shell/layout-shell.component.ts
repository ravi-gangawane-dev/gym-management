import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { HeaderComponent } from '../../header/header.component';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { AppToastComponent } from '../../../shared/components/app-toast/app-toast.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AppToastComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './layout-shell.component.html',
  styleUrls: ['./layout-shell.component.scss']
})
export class LayoutShellComponent { }
