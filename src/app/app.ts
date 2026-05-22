import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoDataResetService } from './core/services/demo-data-reset.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor() {
    inject(DemoDataResetService).initialize();
  }
}
