import { Component } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';
import { SideMenuComponent } from './side-menu/side-menu';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [Dashboard,SideMenuComponent,RouterOutlet]
})
export class App {}

